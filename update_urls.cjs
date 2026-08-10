const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/schan/OneDrive/Desktop/sawarigo/sawarigo-admin/src';

const getAllFiles = (d, arr) => {
  fs.readdirSync(d).forEach(file => {
    const full = path.join(d, file);
    if(fs.statSync(full).isDirectory()) getAllFiles(full, arr);
    else if((full.endsWith('.tsx') || full.endsWith('.ts')) && full !== path.join(dir, 'config.ts')) arr.push(full);
  });
  return arr;
};

const files = getAllFiles(dir, []);
for(const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  if(content.includes('http://localhost:3000')) {
    // Replace hardcoded localhost string to template literals that use API_BASE_URL
    content = content.replace(/'http:\/\/localhost:3000([^']*)'/g, '`${API_BASE_URL}$1`');
    content = content.replace(/"http:\/\/localhost:3000([^"]*)"/g, '`${API_BASE_URL}$1`');
    
    // Add import statement at top
    const relativePath = path.relative(path.dirname(f), dir).replace(/\\/g, '/');
    const importPath = relativePath === '' ? './config' : `${relativePath}/config`;
    
    content = `import { API_BASE_URL } from '${importPath}';\n` + content;
    
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
}
