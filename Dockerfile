FROM node:8

LABEL maintainer="knutole@mapic.io"
LABEL repository="https://github.com/mapic/shiny-auth0.docker"

# add workdir
WORKDIR /usr/src/app

# copy app
COPY app/ ./

# install tools
RUN npm install -g npm-check-updates forever

# install package
RUN npm install -y
