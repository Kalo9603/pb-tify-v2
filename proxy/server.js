const cors_anywhere = require('cors-anywhere');

const host = 'localhost';
const port = 3001;

cors_anywhere.createServer({
  originWhitelist: [],
  requireHeaders: [],
  removeHeaders: [],
}).listen(port, host, () => {
  console.log(`CORS Anywhere proxy running on ${host}:${port}`);
});
