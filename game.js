'use strict';

const uri = process.env.ZORK_ENDPOINT;
const request = require('request-promise');
const $ = require('cheerio');
const _ = require('lodash/fp');
const fs = require('fs');

module.exports = class Game {
  constructor(user) {
    this.user = user;
    this.savegame = '';
    this.savefile = `${__dirname}/${this.user}.save`;
  }

  save() {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        this.savefile,
        JSON.stringify(this.serialize()),
        err => err ? reject(err) : resolve(this)
      );
    });
  }

  load() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.savefile, (err, content) => {
        if (err) {
          reject(err);
        } else {
          const save = JSON.parse(content);
          this.savegame = save.savegame;
          resolve(this);
        }
      });
    });
  }

  process(command) {
    const savegame = this.savegame;

    return request({
      uri,
      method: 'POST',
      form: {
        command,
        savegame
      }
    })
      .then($.load)
      .then($ => {
        this.savegame = $('input[name="savegame"]').val();
        const text = _.filter(line => line.length && line !== '>', _.map(_.trim, $('span').eq(2).text().split("\n")));
        return _.slice(_.lastIndexOf(`>${command}`, text) + 1, text.length, text).join("\n");
      });
  }

  serialize() {
    return {user: this.user, savegame: this.savegame};
  }
};
