import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(process.cwd(), 'src');
const locales = {
  fr: path.join(srcDir, 'i18n/fr.json'),
  en: path.join(srcDir, 'i18n/en.json'),
  de: path.join(srcDir, 'i18n/de.json')
};

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles(srcDir, []);

const tRegex = /t\(\s*['"]([a-zA-Z0-9_.-]+)['"](?:,\s*['"]([^'"]+)['"])?/g;

const foundKeys = new Map(); // key -> defaultValue

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    const key = match[1];
    const defaultValue = match[2] || key;
    if (!foundKeys.has(key)) {
      foundKeys.set(key, defaultValue);
    }
  }
});

console.log(`Found ${foundKeys.size} distinct keys in code.`);

['fr', 'en', 'de'].forEach(lang => {
  const jsonPath = locales[lang];
  const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  let missingCount = 0;
  for (const [key, defaultValue] of foundKeys.entries()) {
    if (!jsonContent.hasOwnProperty(key)) {
      jsonContent[key] = defaultValue;
      missingCount++;
    }
  }
  
  console.log(`Appended ${missingCount} missing keys to ${lang}.json`);
  
  // write back
  fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf-8');
});

console.log('Done!');
