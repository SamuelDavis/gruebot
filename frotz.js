'use strict';

const _ = require('lodash/fp');
const {stat} = require('fs');
const {execFile} = require('child_process');
const iconv = require('iconv');
const INTRO = 'Revision 88 / Serial number 840726';

module.exports = {
  bootGame,
  bindOnOutput,
  write,
  saveGame,
  loadGame
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

function write(frotz, cmd) {
  return new Promise(resolve => {
    frotz.stdin.write(`${cmd}\n`);
    setTimeout(resolve.bind(this, frotz), 1000);
  });
}

function saveGame(frotz, user) {
  const saveFile = buildSaveFile(user);
  write(frotz, 'save');
  return new Promise(resolve => {
    stat(saveFile, err => {
      if (!err) {
        write(frotz, saveFile);
        resolve(write(frotz, 'yes'));
      } else {
        resolve(write(frotz, saveFile));
      }
    })
  });
}

function loadGame(frotz, user) {
  const saveFile = buildSaveFile(user);
  return new Promise(resolve => {
    stat(saveFile, err => {
      if (!err) {
        write(frotz, 'restore');
        resolve(write(frotz, saveFile));
      } else {
        resolve(frotz);
      }
    })
  });
}

function buildSaveFile(user) {
  return `${__dirname}/saves/${user}.save`;
}
