# barrimage

Image text generator hosted on AWS Lambda

![Duke Reading: Microsoft Proprietary License](https://raw.githubusercontent.com/harrego/barrimage/main/.github/dukereading.png)

## Setup

1. Install serverless (`npm i -g serverless`).
2. [Configure serverless with AWS](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/) if you don't already use the AWS CLI tool
3. Make the variables in `serverless.yml` unique and specific to you, if using an existing S3 bucket then comment out the `resources` section at the bottom of the file otherwise serverless will error when attempting to re-create it
4. Run `serverless deploy`

## Usage

Each image generated has its own endpoint with a possible different set of body parameters.

### Duke Reading

Generate an image of Duke (the Java mascot) reading a book of your choice. Make a POST request to `/dukereading` with the body `{ "text": "book title here" }`, an AWS link with the generated image will be returned: `{ "imageUrl": "s3 location url" }`.

## Live Demo

A live demo is being hosted, try it out:

```
curl -H "Content-type: application/json" -d '{"text":"Microsoft Proprietary License"}' 'https://7j20brsw95.execute-api.us-east-1.amazonaws.com/dukereading'
```