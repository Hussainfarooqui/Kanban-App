const { spawnSync } = require('child_process');

function run(cmd, args = []) {
  console.log('> ' + cmd + ' ' + args.join(' '));
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  return r.status === 0;
}

console.log('Checking for Docker...');
const hasDocker = run('docker', ['--version']);
const hasDockerCompose = run('docker-compose', ['--version']) || run('docker', ['compose', 'version']);

if (hasDocker && hasDockerCompose) {
  console.log('Docker and Compose available — running docker dev flow');
  run('npm', ['run', 'dev:docker']);
} else {
  console.log('Docker not available — using local SQLite fallback');
  run('npm', ['run', 'prepare:sqlite']);
}
