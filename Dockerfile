FROM node:6.1
COPY . /usr/src/app
ENV DEBIAN_FRONTEND noninteractive

ENV NODE_ENV production

RUN useradd -Nm -g sudo -s /bin/bash frotzuser

RUN apt-get update \
    && apt-get install unzip frotz

WORKDIR /usr/games
RUN curl -O http://www.infocom-if.org/downloads/zork1.zip \
    && unzip zork1.zip -d zork1 \
    && rm zork1.zip

WORKDIR /usr/src/app
RUN npm install

RUN unset DEBIAN_FRONTEND
