#!/bin/bash

# requires env variables
# - $CIRCLE_TAG

# only publish if this is a tag build
if [[ "$CIRCLE_TAG" ]]; then
  set -e
  # "login"
  echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> ~/.npmrc
  # publish
  npm publish
else
  echo "Not a tag build. Skipping npm publish."
fi
