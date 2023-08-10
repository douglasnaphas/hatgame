#!/usr/bin/env bash
npx cdk bootstrap
STACKNAME=$(npx @cdk-turnkey/stackname@2.1.0 --suffix app --hash 6)
npx cdk deploy --require-approval never ${STACKNAME}