import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const useShell = process.platform === 'win32';

const processes = [
  spawn(npmCommand, ['run', 'server'], { stdio: 'inherit', shell: useShell }),
  spawn(npmCommand, ['run', 'dev:vite'], { stdio: 'inherit', shell: useShell }),
];

function shutdown(signal) {
  for (const child of processes) {
    child.kill(signal);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

for (const child of processes) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      shutdown('SIGTERM');
      process.exit(code);
    }
  });
}
