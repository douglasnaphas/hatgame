#!/usr/bin/env bash
STACKNAME=$(npx @cdk-turnkey/stackname@2.1.0 --suffix role --hash 6)
npx cdk bootstrap
npx cdk@2.110.1 deploy ${STACKNAME}