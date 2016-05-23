'use strict';

module.exports = {
  buildSlackController,
  reply,
  spawnSlackBot
};

function buildSlackController() {
  const controller = require('botkit').slackbot();
  controller.on('rtm_close', () => spawnSlackBot(controller));
  return controller;
}

function reply(bot, message, text) {
  return new Promise((resolve, reject) => {
    bot.replyWithTyping(message, text, err => err ? reject(err) : resolve())
  });
}

function spawnSlackBot(controller) {
  return new Promise((resolve, reject) => {
    controller
      .spawn({
        token: process.env.SLACK_TOKEN
      })
      .startRTM(err => err ? reject(err) : resolve());
  });
}
