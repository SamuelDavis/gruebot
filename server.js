'use strict';

const Game = require('./game');
const controller = require('botkit').slackbot();

controller
  .hears('.*', ['direct_message'], (bot, message) => {
    (new Game(message.user))
      .load()
      .then(game => {
        return game.process(message.text)
          .then(response => {
            game.save();
            return response;
          });
      })
      .then(response => reply(bot, message, response))
      .catch(console.error);
  });

controller
  .spawn({
    token: process.env.SLACK_TOKEN
  })
  .startRTM(err => err ? console.error(`Failed to connect to Slack: ${err}.`) : console.log(`Connected to Slack.`));

function reply(bot, message, text) {
  return new Promise((resolve, reject) => {
    bot.replyWithTyping(message, text, err => err ? reject(err) : resolve())
  });
}

