const { execSync } = require('child_process');

function check(cmd) {
  try {
    const out = execSync(cmd, { stdio: 'pipe' }).toString().trim();
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: '' };
  }
}

const docker = check('docker --version');
const dockerCompose = check('docker-compose --version');
const dockerComposeV2 = check('docker compose version');

console.log('Docker availability check:');
console.log('--------------------------------');
if (docker.ok) console.log('docker:', docker.out); else console.log('docker: not found');
if (dockerCompose.ok) console.log('docker-compose:', dockerCompose.out); else console.log('docker-compose: not found');
if (dockerComposeV2.ok) console.log('docker compose (v2):', dockerComposeV2.out); else console.log('docker compose (v2): not found');

if (!docker.ok) {
  console.log('\nSuggestion:');
  console.log('- Install Docker Desktop for Windows: https://www.docker.com/get-started');
  console.log("- After install, ensure 'docker' is available in your PATH and restart your terminal.");
}

if (!dockerCompose.ok && !dockerComposeV2.ok) {
  console.log('\nDocker Compose not found.');
  console.log('- Docker Desktop includes Compose V2 as `docker compose`.');
  console.log('- If you need the standalone `docker-compose` you can install it separately or use the `docker compose` command.');
}

process.exit(docker.ok ? 0 : 1);
