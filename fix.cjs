const fs = require('fs');

for (let i = 0; i < 7; i++) {
  const f = 'chunk_' + i + '.sql';
  if (!fs.existsSync(f)) continue;
  
  let c = fs.readFileSync(f, 'utf8');
  
  // Make CREATE POLICY idempotent
  // Regex matches: CREATE POLICY "name" ON schema.table
  // also handles newlines and spaces.
  c = c.replace(/CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+([a-zA-Z0-9_.]+)/gi, (match, p1, p2) => {
    return `DROP POLICY IF EXISTS "${p1}" ON ${p2};\nCREATE POLICY "${p1}" ON ${p2}`;
  });

  // Make CREATE INDEX idempotent
  // This is safe to run since we already know the syntax being used.
  c = c.replace(/CREATE\s+INDEX\s+(?!IF NOT EXISTS)(idx_[a-zA-Z0-9_]+)/gi, 'CREATE INDEX IF NOT EXISTS $1');
  
  // Create TYPE idempotent - we just wrap it in a DO block if needed, but since it's already done in chunk_0, it's fine.
  
  fs.writeFileSync(f, c);
  console.log(`Updated ${f} policies and indexes`);
}
