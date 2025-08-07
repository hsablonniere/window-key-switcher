import { build } from 'esbuild';
import { rmSync } from 'fs';
import { execSync } from 'child_process';

const OUTPUT_DIR = 'dist';

// Clean dist directory before building
rmSync(OUTPUT_DIR, { recursive: true, force: true });

const config = {
  entryPoints: [
    'src/extension.js',
    'src/metadata.json',
    'src/schemas/org.gnome.shell.extensions.window-key-switcher.gschema.xml',
  ],
  bundle: true,
  outdir: OUTPUT_DIR,
  format: 'esm',
  platform: 'neutral',
  target: ['es2024'],
  external: ['gi://*', 'resource://*'],
  loader: {
    '.json': 'copy',
    '.xml': 'copy',
  },
  logLevel: 'info',
};

console.log(`## Building extension...`);

console.log('');
console.log(`Creating bundle...`);
await build(config);

console.log('');
console.log('Bundle created successfully!');
console.log(`=> ${OUTPUT_DIR}/extension.js`);

console.log(`Compiling glib schemas...`);
execSync(`glib-compile-schemas src/schemas --targetdir dist/schemas`, { stdio: 'pipe', encoding: 'utf8' });
console.log(`Glib schemas compiled successfully!`);
