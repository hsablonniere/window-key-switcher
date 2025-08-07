import { execSync } from 'child_process';
import metadata from '../src/metadata.json' with { type: 'json' };

const EXTENSION_SOURCE_DIR = 'dist';
const OUTPUT_DIR = 'dist';

console.log(`## Packaging extension...`);

execSync(`gnome-extensions pack --force --out-dir=${OUTPUT_DIR} ${EXTENSION_SOURCE_DIR}`,{stdio:'pipe',encoding: 'utf8'});

console.log('');
console.log('Extension packaged successfully!');
console.log(`=> ${EXTENSION_SOURCE_DIR}/${metadata.uuid}.shell-extension.zip`);
