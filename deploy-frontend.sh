#!/usr/bin/env bash
set -e
STACKNAME=$(npx @cdk-turnkey/stackname@2.1.0 --suffix app --hash 6)
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name ${STACKNAME} | \
  jq '.Stacks[0].Outputs | map(select(.OutputKey == "FrontendBucketName"))[0].OutputValue' | \
  tr -d \")
if ! aws s3 ls "s3://${BUCKET}" &> /dev/null
then
  echo "error, deploy-to-bucket: unable to ls on s3://${BUCKET}"
  exit 1
fi
aws s3 sync --content-type "text/html" --exclude "*" --include "*.html" --delete frontend/ s3://${BUCKET}/
aws s3 sync --content-type "image/png" --exclude "*" --include "*.png" --delete frontend/ s3://${BUCKET}/
aws s3 sync --content-type "image/svg+xml" --exclude "*" --include "*.svg" --delete frontend/ s3://${BUCKET}/