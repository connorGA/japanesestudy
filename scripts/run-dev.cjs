'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = process.env.INIT_CWD || process.cwd();
const concurrentlyJs = path.join(
  root,
  'node_modules',
  'concurrently',
  'dist',
  'bin',
  'concurrently.js',
);

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function run() {
  if (!fs.existsSync(concurrentlyJs)) {
    die(
      'concurrently is not installed (missing node_modules). From the project root run:\n' +
        '  .\\npm-install-windows.cmd\n' +
        'or install on a mapped drive / local folder, then: npm install\n',
    );
  }

  const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const cmd1 = `${npmBin} run dev:web`;
  const cmd2 = `${npmBin} run dev:api`;
  const env = { ...process.env, INIT_CWD: root };

  if (process.platform === 'win32') {
    const systemRoot = process.env.SystemRoot || 'C:\\Windows';
    const q = (s) => `"${String(s).replace(/"/g, '\\"')}"`;
    const line = [
      'pushd',
      q(root),
      '&&',
      q(process.execPath),
      q(concurrentlyJs),
      q(cmd1),
      q(cmd2),
    ].join(' ');

    const child = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', line], {
      stdio: 'inherit',
      cwd: systemRoot,
      env,
    });
    child.on('error', (err) => die(err.message));
    child.on('exit', (code, signal) => {
      if (signal) process.exit(1);
      process.exit(code ?? 1);
    });
    return;
  }

  const child = spawn(process.execPath, [concurrentlyJs, cmd1, cmd2], {
    stdio: 'inherit',
    cwd: root,
    env,
  });
  child.on('error', (err) => die(err.message));
  child.on('exit', (code, signal) => {
    if (signal) process.exit(1);
    process.exit(code ?? 1);
  });
}

run();
