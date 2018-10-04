FROM node:8

LABEL maintainer="knutole@mapic.io"
LABEL repository="https://github.com/mapic/shiny-auth0.docker"

# add workdir
WORKDIR /usr/src/app

# copy app
COPY app/ ./

# install tools
RUN npm i -g npm-check-updates

# install package
RUN npm i -y
