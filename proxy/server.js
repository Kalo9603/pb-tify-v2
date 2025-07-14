const cors_anywhere = require('cors-anywhere');
const { config } = require('../src/utilities/config.js');

cors_anywhere.createServer({
  originWhitelist: [],
  requireHeader: [],
  removeHeaders: [],

}).listen(config.ports.proxy, config.host, () => {
  console.log(`CORS Anywhere proxy running on ${config.host}:${config.ports.proxy}`);
});
