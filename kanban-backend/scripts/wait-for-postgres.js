const net = require('net');

function waitForPort(host, port, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function tryConnect() {
      const socket = new net.Socket();
      socket.setTimeout(2000);
      socket.once('error', () => { socket.destroy(); check(); });
      socket.once('timeout', () => { socket.destroy(); check(); });
      socket.connect(port, host, () => {
        socket.end();
        resolve();
      });

      function check() {
        if (Date.now() - start > timeout) {
          reject(new Error('Timeout waiting for port'));
        } else {
          setTimeout(tryConnect, 1000);
        }
      }
    })();
  });
}

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '5432', 10);

console.log(`Waiting for Postgres at ${host}:${port} ...`);
waitForPort(host, port, 60000)
  .then(() => { console.log('Postgres is accepting connections'); process.exit(0); })
  .catch((err) => { console.error(err.message); process.exit(1); });
