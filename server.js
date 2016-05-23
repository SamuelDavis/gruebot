'use strict';

const _ = require('lodash/fp');
const {buildSlackController, reply, spawnSlackBot} = require('./slack');
const {bootGame, bindOnOutput, input, loadGame, saveGame, buildSaveFile, userHasSave} = require('./frotz');
const {stat, writeFile} = require('fs');
const {FROTZ, GREETING, REBUFF} = {
  GREETING: 'Shh. I\'m secret; don\'t tell anyone. Why don\'t you try `look`ing around?',
  REBUFF: 'http://orig05.deviantart.net/b523/f/2012/050/0/5/you_are_likely_to_be_eaten_by_a_grue_by_nmajmani-d4qbkrg.png',
  FROTZ: {
    APP: `${__dirname}/lib/dfrotz`,
    GAMES: {
      ZORK1: `${__dirname}/lib/games/ZORK1.DAT`
    }
  }
};
const controller = buildSlackController();

controller.hears('.*', ['direct_message'], (bot, message) => {
  const {text, user} = message;
  if (!userHasSave(user)) {
    sayWithTyping(bot, message, REBUFF);
  } else {
    bootGame(FROTZ.APP, FROTZ.GAMES.ZORK1)
      .then(frotz => loadGame(frotz, user))
      .then(frotz => bindOnOutput(frotz, text => text ? reply(bot, message, text) : frotz))
      .then(frotz => input(frotz, text))
      .then(frotz => saveGame(frotz, user))
      .catch(err => reply(bot, message, err.message));
  }
});

controller.hears('.*', ['ambient'], (bot, message) => {
  const {user} = message;
  checkShouldTalkToAmbientUser(user)
    .then(() => sayWithTyping(bot, message, GREETING))
    .then(() => writeFile(buildSaveFile(user)))
    .catch(console.error);
});

function checkShouldTalkToAmbientUser(user) {
  return new Promise((resolve, reject) => {
    stat(buildSaveFile(user), err => err && _.random(0, 99) === 0 ? resolve() : reject());
  });
}

function sayWithTyping(bot, message, text) {
  return new Promise(resolve => {
    bot.startPrivateConversation(message, (err, dm) => {
      dm.say({type: 'typing', text});
      setTimeout(() => {
        dm.say(text);
        resolve();
      }, _.max(1000, 10 * text.length));
    });
  });
}

spawnSlackBot(controller).catch(console.error);
