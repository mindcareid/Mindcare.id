const http = require('http');
const options = {
  hostname: 'localhost',
  port: 3110,
  path: '/api/auth/csrf',
  method: 'GET'
};
const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('CSRF:', data));
});
req.end();
