#!/bin/sh

case $1 in
    backend)
        export PATH=/opt/app/backend/node_modules/.bin:$PATH
        /wait
        cd backend
        exec node ./index.js
        ;;
    frontend)
        export PATH=/opt/app/frontend/node_modules/.bin:$PATH
        cd frontend/dist
        exec http-server
        ;;
    *)
        echo No idea what to do with $@
        exit 1
        ;;
esac
