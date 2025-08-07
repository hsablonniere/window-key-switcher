import { execSync } from 'child_process';
import metadata from '../src/metadata.json' with { type: 'json' };

const ZIP_FILE = `dist/${metadata.uuid}.shell-extension.zip`;

console.log('## Installing extension...');
console.log('');

// Disable the extension if it's currently enabled
console.log('Disabling extension if currently enabled...');
try {
  execSync(`gnome-extensions disable "${metadata.uuid}"`,{stdio:'pipe',encoding: 'utf8'});
  console.log('Extension disabled successfully!');
} catch (error) {
  console.log('Extension was not enabled (or already disabled)');
}

// Install the extension from the zip file
console.log('Installing new extension...');
execSync(`gnome-extensions install --force "${ZIP_FILE}"`,{stdio:'pipe',encoding: 'utf8'});

console.log('Extension installed successfully!');

console.log('');
console.log('To activate the extension:');
console.log('1. Restart GNOME Shell: Alt+F2, type "r", press Enter');
console.log('2. Or log out and back in');
console.log('3. Then enable the extension with: npm run enable');
