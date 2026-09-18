const path = require('path');
const bundle = require(path.join(__dirname, 'server_bundle.js'));
const app = bundle.app || bundle.default || bundle;

module.exports = function handler(req, res) {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
