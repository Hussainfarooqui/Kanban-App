const { spawnSync } = require('child_process');
const path = require('path');

function run(cmd, args, opts = {}) {
  console.log('>', cmd, args.join(' '));
  // Avoid shell quoting issues by not using a shell and passing args array
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  if (res.status !== 0) process.exit(res.status);
}

const repoRoot = path.resolve(__dirname, '..');
const schemaPath = path.join(repoRoot, 'prisma', 'schema.sqlite.prisma');

// Generate client for sqlite schema, push schema and run seed
run('npx', ['prisma', 'generate', '--schema', schemaPath]);
run('npx', ['prisma', 'db', 'push', '--schema', schemaPath]);
// Run the TypeScript seed via ts-node to ensure it executes correctly
run('npx', ['ts-node', 'prisma/seed.ts'], { cwd: repoRoot });

console.log('✅ SQLite DB prepared.');
