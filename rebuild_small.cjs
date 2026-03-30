const fs = require('fs');
const path = require('path');

const dir = 'supabase/migrations';
const allFiles = fs.readdirSync(dir).sort();

let remaining = allFiles.filter(f => f > '20250924100000_complete_knowledge_base.sql');

// Exclude the duplicate initial schema
remaining = remaining.filter(f => f !== '20251004130105_20250121000000_initial_schema.sql');

// Extract the 4 chat files
const chatFiles = [
  '20251104020000_add_messaging_system.sql',
  '20251104030000_add_presence_features.sql',
  '20251104010000_fix_chat_presence_and_storage.sql',
  '20251104000000_fix_chat_final.sql'
];

remaining = remaining.filter(f => !chatFiles.includes(f));

// Prepend the chat files
const finalFiles = [...chatFiles, ...remaining];

let chunkIndex = 2;
let currentChunk = '';
const MAX_CHUNK_SIZE = 35000; // 150KB roughly

function finalizeChunk(content, index) {
  // Make idempotent
  let c = content;
  c = c.replace(/ADD COLUMN(?! IF NOT EXISTS)/gi, 'ADD COLUMN IF NOT EXISTS');
  c = c.replace(/CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+([a-zA-Z0-9_.]+)/gi, (m, p1, p2) => {
    return `DROP POLICY IF EXISTS "${p1}" ON ${p2};\nCREATE POLICY "${p1}" ON ${p2}`;
  });
  c = c.replace(/CREATE\s+INDEX\s+(?!IF NOT EXISTS)(idx_[a-zA-Z0-9_]+)/gi, 'CREATE INDEX IF NOT EXISTS $1');
  
  fs.writeFileSync(`chunk_${index}_new.sql`, c);
  console.log(`Created chunk_${index}_new.sql with size ${c.length}`);
}

for (const f of finalFiles) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (currentChunk.length + content.length > MAX_CHUNK_SIZE) {
    finalizeChunk(currentChunk, chunkIndex);
    chunkIndex++;
    currentChunk = '';
  }
  currentChunk += content + '\n\n';
}

if (currentChunk.length > 0) {
  finalizeChunk(currentChunk, chunkIndex);
}
