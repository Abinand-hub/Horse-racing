const serverModule = require('../dist/serverless.cjs');
const app = serverModule.default || serverModule.app || serverModule;

module.exports = function handler(req, res) {
  return app(req, res);
};
