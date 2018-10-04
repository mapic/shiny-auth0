#!/bin/bash
npm i -y
forever --watch --debug --verbose ./bin/www
