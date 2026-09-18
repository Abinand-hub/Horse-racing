const path = require('path');
const bundle = require(path.join(__dirname, 'server_bundle.js'));
const app = bundle.app || bundle.default || bundle;

module.exports = function handler(req, res) {
  return app(req, res);
};
