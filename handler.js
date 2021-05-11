'use strict';

const jimp = require("jimp")
const { v4: uuid } = require('uuid')

const AWS = require("aws-sdk")
const s3 = new AWS.S3()

const bucket = process.env.Bucket;

async function dukeText(text) {
    var image = await jimp.read("dukereading.png")
    
    var originalImageWidth = image.bitmap.width
    var originalImageHeight = image.bitmap.height
    
    var font = await jimp.loadFont(jimp.FONT_SANS_128_BLACK)
    
    var spacesCount = (text.match(/ /g) || []).length
    
    var box = {
        x: 230,
        y: 217,
        width: 130,
        height: 35
    }
    
    var textCalculation = text.replace(/ /g, "")
    var textWidth = jimp.measureText(font, textCalculation) + (spacesCount * 35)
    var textHeight = jimp.measureTextHeight(font, textCalculation, textWidth)
    
    let newTextWidth = box.width
    let newTextHeight = Math.ceil((newTextWidth / textWidth) * textHeight)
    
    if (newTextHeight > box.height) {
        newTextHeight = box.height
        newTextWidth = Math.ceil((newTextHeight / textHeight) * textWidth)
    }
    
    var fontCanvas = await jimp.create(textWidth, textHeight)
    fontCanvas.print(font, 0, 0, text).resize(newTextWidth, newTextHeight)/*.rotate(-30)*/
    
    var blit = {
        x: ((box.width - newTextWidth) / 2) + box.x,
        y: ((box.height - newTextHeight) / 2) + box.y
    }
    
    var rotatedBlit = image.rotate(32).blit(fontCanvas, blit.x, blit.y)
    var rotatedBlitBitmap = rotatedBlit.bitmap
    
    var crop = {
        x: (rotatedBlit.bitmap.width - originalImageWidth),
        y: (rotatedBlit.bitmap.height - originalImageHeight),
        width: originalImageWidth,
        height: originalImageHeight
    }
    
    var finalImage = await rotatedBlit.rotate(-32).autocrop()
    return await finalImage.getBufferAsync("image/png")
}

async function uploadToS3(data, key) {
    return await s3.putObject({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: "image/png",
        ACL: "public-read"
    }).promise()
}

module.exports.dukereading = async (event) => {
    let requestBody
    try {
        requestBody = JSON.parse(event.body)
    } catch (error) {
        return {
            statusCode: 422,
            body: JSON.stringify({
                message: "Invalid data"
            })
        }
    }
    
    const text = requestBody.text
    if (!text) {
        return {
            statusCode: 422,
            body: JSON.stringify({
                message: "Missing text field"
            })
        }
    }
    
    try {
        const objectKey = `${uuid()}.png`
        const imageData = await dukeText(text)
        const s3Response = await uploadToS3(imageData, objectKey)
    
        return {
            statusCode: 200,
            body: JSON.stringify({
                imageUrl: `${process.env.BucketUrl}/${objectKey}`
            })
        }
    } catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error"
            })
        }
    }
};
