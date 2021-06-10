FROM node:14-alpine

ADD package.json yarn.lock /opt/app/
WORKDIR /opt/app
RUN yarn install --frozen-lockfile && yarn cache clean
ADD . /opt/app

EXPOSE 3000
ENTRYPOINT ["node", "./index.js"]
