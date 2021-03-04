#!/bin/sh

case $1 in
    backend)
        export PATH=/opt/app/backend/node_modules/.bin:$PATH
        exec "/wait && cd backend && node ./index.js"
        ;;
    frontend)
        export PATH=/opt/app/frontend/node_modules/.bin:$PATH
        exec "cd frontend/dist && http-server"
        ;;
    *)
        echo No idea what to do with $@
        exit 1
        ;;
esac
