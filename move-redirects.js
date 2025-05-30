const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'dist', 'angular-starter', 'browser', '_redirects');
const destPath = path.join(__dirname, 'dist', 'angular-starter', '_redirects');

if (fs.existsSync(sourcePath)) {
  fs.renameSync(sourcePath, destPath);
  console.log('Moved _redirects to dist/angular-starter/');
} else {
  console.error('Error: _redirects file not found in dist/angular-starter/browser/');
}