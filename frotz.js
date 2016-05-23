'use strict';

const _ = require('lodash/fp');
const {statSync} = require('fs');
const {execFile} = require('child_process');
const iconv = require('iconv');

module.exports = {
  bootGame,
  bindOnOutput,
  input,
  saveGame,
  loadGame,
  buildSaveFile,
  userHasSave
};

function bootGame(app, game) {
  return new Promise((resolve, reject) => {
    resolve(execFile(app, ['-w', 1000, game], {'encoding': 'latin1'}, err => reject(err)));
  });
}

function bindOnOutput(frotz, cb) {
  frotz.stdout.on('data', data => {
    const encoder = new iconv.Iconv('latin1', 'utf-8');
    const lines = encoder
      .convert(data, 'utf8')
      .toString()
      .trim()
      .replace('\r', '')
      .split('\n');
    const start = _.startsWith('I don\'t know', lines[0]) ? 0 : lines[2] === 'Ok.' ? 5 : 2;

    cb(lines.slice(start, lines.length - 2).join("\n"));
  });
  return frotz;
}

function input(frotz, cmd) {
  return new Promise(resolve => {
    frotz.stdin.write(`${cmd}\n`);
    setTimeout(resolve.bind(this, frotz), 1000);
  });
}

function saveGame(frotz, user) {
  const saveFile = buildSaveFile(user);
  input(frotz, 'save');
  if (!userHasSave(user)) {
    input(frotz, saveFile);
    return input(frotz, 'yes');
  }
  return input(frotz, saveFile);
}

function loadGame(frotz, user) {
  const saveFile = buildSaveFile(user);
  if (!userHasSave(user)) {
    return frotz;
  }
  input(frotz, 'restore');
  return input(frotz, saveFile);
}

function buildSaveFile(user) {
  return `${__dirname}/saves/${user}.save`;
}

function userHasSave(user) {
  try {
    statSync(buildSaveFile(user));
    return true;
  } catch (ex) {
    return false;
  }
}
