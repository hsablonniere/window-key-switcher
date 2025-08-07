import { execSync } from 'child_process';
import metadata from '../src/metadata.json' with { type: 'json' };

console.log('## Enabling extension...');

execSync(`gnome-extensions enable ${metadata.uuid}`,{stdio:'pipe',encoding: 'utf8'});

console.log(`Extension enabled successfully!`);
