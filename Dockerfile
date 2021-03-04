FROM node:14-alpine

# start with everything
ADD . /opt/app

# install the frontend deps
WORKDIR /opt/app/frontend
RUN yarn install --frozen-lockfile && yarn cache clean && yarn build && npm install http-server
EXPOSE 8080

# install backend deps
WORKDIR /opt/app/backend
RUN yarn install --frozen-lockfile && yarn cache clean
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait
EXPOSE 3000

# get ready to go
WORKDIR /opt/app
ENTRYPOINT ["sh", "./entrypoint.sh"]
