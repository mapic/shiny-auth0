#!/bin/bash

docker build -t mapic/shiny-auth0 .

docker push mapic/shiny-auth0:latest