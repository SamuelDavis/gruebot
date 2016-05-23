'use strict';

const {buildSlackController, reply, spawnSlackBot} = require('./slack');
const {bootGame, bindOnOutput, write, loadGame, saveGame} = require('./frotz');
const {FROTZ} = {
  FROTZ: {
    APP: `${__dirname}/lib/dfrotz`,
    GAMES: {
      ZORK1: `${__dirname}/lib/games/ZORK1.DAT`
    }
  }
};

const controller = buildSlackController();
controller.hears('.*', ['direct_message'], (bot, message) => {
  bootGame(FROTZ.APP, FROTZ.GAMES.ZORK1)
    .then(frotz => loadGame(frotz, message.user))
    .then(frotz => bindOnOutput(frotz, text => text ? reply(bot, message, text) : frotz))
    .then(frotz => write(frotz, message.text))
    .then(frotz => saveGame(frotz, message.user))
    .catch(err => {
      console.error({err});
      reply(bot, message, err.message)
    });
});

spawnSlackBot(controller).catch(console.error);
