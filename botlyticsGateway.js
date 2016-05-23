'use strict';

const http = require('http');
const _ = require('lodash/fp');

module.exports = {
  logIncoming: _.curry(log)('incoming'),
  logOutgoing: _.curry(log)('outgoing')
};

function log(kind, conversation_identifier, text) {
  return new Promise((resolve, reject) => {
    const options = {
      'method': 'POST',
      'hostname': 'www.botlytics.co',
      'port': null,
      'path': `/api/v1/messages?token=${process.env.BOTLYTICS_TOKEN}`,
      'headers': {}
    };
    const message = {kind, conversation_identifier, text};

    const req = http.request(options, res => {
      const chunks = [];
      res.on('error', reject);
      res.on('data', chunks.push);
      res.on('end', resolve.bind(this, Buffer.concat(chunks).toString()));
    });

    req.write(JSON.stringify({message}));
    req.end();
  });
}