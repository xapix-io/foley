FROM node:14-alpine

ADD . /opt/app
WORKDIR /opt/app

RUN yarn install --frozen-lockfile && yarn cache clean

ENV PATH /opt/app/node_modules/.bin:$PATH

COPY entrypoint-dev.sh .
ENTRYPOINT ["sh", "./entrypoint-dev.sh"]

EXPOSE 3000

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait
