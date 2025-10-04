const https = require('http');
const http = require('http');

// Allow overriding credentials via env vars or CLI args
const args = process.argv.slice(2);
const argEmail = args[0];
const argPassword = args[1];
const email = process.env.EMAIL || argEmail || 'admin@example.com';
const password = process.env.PASSWORD || argPassword || 'password123';

const payload = JSON.stringify({ email, password });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.access_token) {
        console.log('access_token:', json.access_token);
        process.exit(0);
      }
      console.error('No token in response:', json);
      process.exit(2);
    } catch (e) {
      console.error('Failed to parse response:', e.message);
      console.error('Raw response:', data);
      process.exit(3);
    }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
  process.exit(4);
});

req.write(payload);
req.end();
