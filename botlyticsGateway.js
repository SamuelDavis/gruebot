'use strict';

const request = require('request-promise');
const _ = require('lodash/fp');
const writeEndpoint = `${process.env.BOTLYTICS_URL}?token=${process.env.BOTLYTICS_TOKEN}`;

module.exports = {
  logIncoming: _.curry(logMessage)('incoming'),
  logOutgoing: _.curry(logMessage)('outgoing')
};

function logMessage(kind, conversation_identifier, text) {
  if (!text) {
    return new Promise(resolve => resolve());
  }
  return request({
    method: 'POST',
    uri: writeEndpoint,
    json: true,
    body: {message: {kind, conversation_identifier, text}}
  });
}
