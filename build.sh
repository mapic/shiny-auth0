#!/bin/bash

# build
docker build -t mapic/shiny-auth0 .

# verify
if [ "$?" -gt "0" ]; then
    echo "Build errored."
    exit 1
fi

# push
docker push mapic/shiny-auth0:latest