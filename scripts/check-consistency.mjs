#!/usr/bin/env node
/**
 * Contrôle de cohérence du dépôt.
 *
 * Vérifie que le numéro de téléphone de l'entreprise est identique partout,
 * qu'aucun tiret cadratin "IA" ni caractère invisible n'a réapparu, et que
 * les traductions ne contiennent pas de clés non traduites visibles.
 *
 * Usage : node scripts/check-consistency.mjs
 * Sortie : code 0 si tout est conforme, 1 sinon.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const CONTACT_PHONE = '+49 15510 626077';
export const CONTACT_PHONE_DIGITS = '4915510626077';

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'coverage']);
const SKIP_FILES = new Set(['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']);

// Tirets cadratins et apparentés, souvent signature d'une rédaction IA
const AI_DASHES = {
  '\u2014': 'EM DASH (tiret cadratin)',
  '\u2013': 'EN DASH (demi-tiret)',
  '\u2015': 'HORIZONTAL BAR',
  '\u2012': 'FIGURE DASH',
  '\u2011': 'NON-BREAKING HYPHEN',
};
// Caractères de direction / largeur nulle qui cassent les liens et l'affichage
const INVISIBLE = {
  '\u200b': 'ZERO WIDTH SPACE',
  '\u200c': 'ZERO WIDTH NON-JOINER',
  '\u200d': 'ZERO WIDTH JOINER',
  '\u200e': 'LEFT-TO-RIGHT MARK',
  '\u200f': 'RIGHT-TO-LEFT MARK',
  '\u202a': 'LEFT-TO-RIGHT EMBEDDING',
  '\u202b': 'RIGHT-TO-LEFT EMBEDDING',
  '\u202c': 'POP DIRECTIONAL FORMATTING',
  '\u202d': 'LEFT-TO-RIGHT OVERRIDE',
  '\u202e': 'RIGHT-TO-LEFT OVERRIDE',
  '\u2060': 'WORD JOINER',
  '\ufeff': 'BYTE ORDER MARK',
};

const errors = [];
const warnings = [];

function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), onFile);
    } else if (entry.isFile()) {
      if (SKIP_FILES.has(entry.name)) continue;
      onFile(path.join(dir, entry.name));
    }
  }
}

function rel(p) {
  return path.relative(ROOT, p);
}

/* ------------------------------------------------------------------ 1. texte */
const textFiles = [];
walk(ROOT, (file) => {
  const ext = path.extname(file).toLowerCase();
  if (['.ts', '.tsx', '.js', '.cjs', '.mjs', '.jsx', '.json', '.html', '.xml',
       '.md', '.txt', '.css', '.sql', '.yml', '.yaml', '.toml', '.sh', '.conf'].includes(ext)) {
    textFiles.push(file);
  }
});

let phoneHits = 0;
for (const file of textFiles) {
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    for (const [ch, name] of Object.entries(AI_DASHES)) {
      if (line.includes(ch)) {
        errors.push(`${rel(file)}:${i + 1} [${name}] ${line.trim().slice(0, 100)}`);
      }
    }
    for (const [ch, name] of Object.entries(INVISIBLE)) {
      if (line.includes(ch)) {
        errors.push(`${rel(file)}:${i + 1} [${name}] ${line.trim().slice(0, 100)}`);
      }
    }
  });

  // numéro de téléphone : toute suite de 10+ chiffres（含 séparateurs) doit être
  // soit le numéro de l'entreprise, soit un numéro de service connu
  for (const [i, line] of lines.entries()) {
    const digits = line.replace(/\D/g, '');
    if (digits.length >= 11 && digits.includes(CONTACT_PHONE_DIGITS)) phoneHits++;
  }
}

/* --------------------------------------------------- 2. cohérence du numéro */
const phoneSources = [
  'src/lib/constants.ts',
  'index.html',
  'src/i18n/de.json',
  'src/i18n/en.json',
  'src/i18n/fr.json',
  'public/locales/de.json',
  'src/lib/seoData.ts',
  'src/components/seo/SEOHead.tsx',
  'src/pages/Home.tsx',
  'supabase/functions/contact-german/index.ts',
  'supabase/functions/submit-order/index.ts',
];
for (const relPath of phoneSources) {
  const file = path.join(ROOT, relPath);
  if (!fs.existsSync(file)) {
    errors.push(`${relPath} : fichier introuvable`);
    continue;
  }
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes(CONTACT_PHONE)) {
    errors.push(`${relPath} : ne contient pas « ${CONTACT_PHONE} »`);
  }
}

// aucun autre numéro d'entreprise ne doit traîner
const stalePattern = /\+49[\s\d()-]{9,}/g;
for (const file of textFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const m of content.matchAll(stalePattern)) {
    const normalized = m[0].replace(/\D/g, '');
    if (normalized === CONTACT_PHONE_DIGITS) continue;
    warnings.push(`${rel(file)} : autre numéro « ${m[0].trim()} »`);
  }
}

/* --------------------------------------------- 3. traductions non traduites */
function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, key));
    else out[key] = v;
  }
  return out;
}

for (const lang of ['de', 'en', 'fr']) {
  const file = path.join(ROOT, `src/i18n/${lang}.json`);
  if (!fs.existsSync(file)) continue;
  const flat = flatten(JSON.parse(fs.readFileSync(file, 'utf8')));
  for (const [key, value] of Object.entries(flat)) {
    if (typeof value === 'string' && value.trim() === key.trim() && key.includes('.')) {
      warnings.push(`src/i18n/${lang}.json : « ${key} » n'est pas traduit`);
    }
  }
}

/* --------------------------------------------------------------- 4. rapport */
console.log('Contrôle de cohérence');
console.log('='.repeat(60));
console.log(`Fichiers analysés      : ${textFiles.length}`);
console.log(`Occurrences du numéro  : ${phoneHits}`);
console.log(`Erreurs                : ${errors.length}`);
console.log(`Avertissements         : ${warnings.length}`);

if (warnings.length) {
  console.log('\nAvertissements :');
  for (const w of warnings.slice(0, 40)) console.log('  - ' + w);
  if (warnings.length > 40) console.log(`  ... +${warnings.length - 40} autres`);
}

if (errors.length) {
  console.log('\nErreurs :');
  for (const e of errors) console.log('  ✗ ' + e);
  process.exit(1);
}

console.log('\n✓ Aucune erreur. Le dépôt est cohérent.');
