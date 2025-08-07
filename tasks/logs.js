import { spawn } from 'child_process';
import { LOG_PREFIX } from '../src/logger.js';

const journalctl = spawn('journalctl', ['--since', '1 minute ago', '-f', '-o', 'cat']);

journalctl.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  for (const line of lines) {
    if (line.startsWith(LOG_PREFIX)) {
      const cleanedLine = line.replace(LOG_PREFIX, '');
      console.log(cleanedLine);
    }
  }
});

process.on('SIGINT', () => {
  journalctl.kill();
  process.exit(0);
});
