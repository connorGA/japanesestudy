'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = process.env.INIT_CWD || process.cwd();
const uvicorn = path.join(
  root,
  '.venv',
  process.platform === 'win32' ? 'Scripts' : 'bin',
  process.platform === 'win32' ? 'uvicorn.exe' : 'uvicorn',
);

function die(msg) {
  console.error(msg);
  process.exit(1);
}

if (!fs.existsSync(uvicorn)) {
  die(
    'uvicorn is not installed in .venv. From the project root run:\n' +
      '  python -m venv .venv\n' +
      '  .venv/bin/python -m pip install -e "apps/api[dev]"\n',
  );
}

const child = spawn(
  uvicorn,
  ['app.main:app', '--reload', '--app-dir', path.join(root, 'apps', 'api')],
  {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env, INIT_CWD: root },
  },
);

child.on('error', (err) => die(err.message));
child.on('exit', (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 1);
});
