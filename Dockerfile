FROM node:6.1
COPY . /usr/src/app

ENV NODE_ENV production

WORKDIR /usr/src/app
RUN npm install

CMD '/usr/src/app/docker/start-production.sh'
