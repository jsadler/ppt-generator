# AI PowerPoint Presentation Generator

This project deploys an AI-powered presentation generator using AWS CloudFormation. It uses Amazon Bedrock's Claude V2 model to generate presentation content and creates PowerPoint presentations automatically.

## Prerequisites

- An AWS Account
- Model access enabled for Anthropic Claude V2 in Amazon Bedrock:
  1. Navigate to Amazon Bedrock console
  2. Go to "Model access"
  3. Request and enable access for "Anthropic Claude V2"

## Deployment Instructions

### Step 1: Deploy CloudFormation Stack
1. Sign in to the AWS Management Console
2. Navigate to CloudFormation
3. Click "Create stack" (with new resources)
4. Upload the `presentation-generator.yml` template
5. Fill in the stack parameters:
   - `FrontendBucketName`: Name for the frontend S3 bucket (or leave default)
   - `StorageBucketName`: Name for the storage S3 bucket (or leave default)
6. Click through the remaining steps and create the stack
7. Wait for the stack creation to complete

### Step 2: Upload Frontend Files
1. Navigate to the S3 console
2. Find the frontend bucket (it will have the name you specified or the default with account ID and region prefixed)
3. Upload the conents of 'frontend' to the root of your s3 bucket

### Step 3: Access the Application
1. Go to the CloudFormation console
2. Select your stack
3. Go to the "Outputs" tab
4. Find the CloudFront URL
5. Open the URL in your browser

## Usage
1. Enter a topic for your presentation
2. Specify the number of slides
3. Click "Generate"
4. Wait for the presentation to be generated
5. Click the download button to get your PowerPoint file

## Additional Resources
- Lambda Function Code
  1. The complete Lambda function code is included directly in the CloudFormation template for convenience. However, if you need to modify it, you can find the original code in the PresentationGenerator-bef23704 zip file.
- Python-PPTX Layer
  1. If you encounter Lambda execution errors related to the python-pptx library, you may need to add the provided Lambda layer. The layer is included in the python-pptx folder.
 
## Troubleshooting

- If you encounter a 403 error when accessing the CloudFront URL:
    1. Ensure all frontend files are uploaded to the root of the S3 bucket
    
    2. Create a CloudFront invalidation:
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Clean Up
- To avoid incurring future charges, delete the resources:
  1. Empty both S3 buckets
  2. Delete the CloudFormation stack

## Security
### This template creates a secure deployment with:
1. Private S3 buckets
2. CloudFront Origin Access Control
3. Appropriate IAM roles and policies
4. HTTPS-only access
