const fs = require('fs');
const path = require('path');

const dir = 'supabase/migrations';

const orderedFiles = [
// Core Chat Tables MUST run first
'20251104020000_add_messaging_system.sql',
'20251104030000_add_presence_features.sql',
'20251104010000_fix_chat_presence_and_storage.sql',
'20251104000000_fix_chat_final.sql',

// Core Gallery System MUST run before gallery mods
'20250928120000_create_gallery_system.sql',
'20250929100000_create_gallery_system.sql', // duplicate or update, safe if idempotent
'20250928090000_add_status_to_gallery.sql',
'20250929100000_add_gallery_interactions.sql',

// Other table creations
'20250928120000_create_application_documents_bucket.sql',
'20250929100000_create_application_documents_bucket.sql',
'20250926000000_final_social_testimonials.sql',
'20250926000000_finalize_testimonials_storage.sql',
'20250926100000_knowledge_base.sql',

// Modify/Alter tables
'20250926000000_fix_profile_address_columns.sql',
'20250926000000_fix_profiles_schema.sql',
'20250926100000_add_public_profile_fields.sql',
'20250926100000_add_testimonial_license_relations.sql',
'20250927000000_testimonial_enhancements.sql',
'20250928100000_add_form_data_to_applications.sql',
'20250928120000_add_pending_payment_status.sql',

// Chat Additions that depend on core chat
'20250928110000_add_read_receipts_to_chat.sql',
'20250928120000_fix_chat_function_and_policy.sql',
'20250928130000_add_chat_functions.sql',
'20250929100000_add_presence_features.sql',
'20250929100000_fix_chat_functions.sql',
'20250929120000_fix_chat_schema.sql',
'20250929120000_fix_messaging_functions_and_rls.sql',
'20250929140000_fix_chat_function.sql',

// Major updates
'20251103000000_german_fuhrerschein_schema.sql'
];

let chunkIndex = 2;
let currentChunk = '';
const MAX_CHUNK_SIZE = 35000;

function finalizeChunk(content, index) {
  let c = content;
  c = c.replace(/TIMESTAMPTZ WITH TIME ZONE/gi, 'TIMESTAMPTZ');
  c = c.replace(/ADD COLUMN(?! IF NOT EXISTS)/gi, 'ADD COLUMN IF NOT EXISTS');
  c = c.replace(/CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+([a-zA-Z0-9_.]+)/gi, (m, p1, p2) => {
    return `DROP POLICY IF EXISTS "${p1}" ON ${p2};\nCREATE POLICY "${p1}" ON ${p2}`;
  });
  c = c.replace(/CREATE\s+INDEX\s+(?!IF NOT EXISTS)(idx_[a-zA-Z0-9_]+)/gi, 'CREATE INDEX IF NOT EXISTS $1');
  
  fs.writeFileSync(`chunk_${index}_final.sql`, c);
  console.log(`Created chunk_${index}_final.sql`);
}

for (const f of orderedFiles) {
  const fileContent = fs.readFileSync(path.join(dir, f), 'utf8');
  if (currentChunk.length + fileContent.length > MAX_CHUNK_SIZE) {
    finalizeChunk(currentChunk, chunkIndex);
    chunkIndex++;
    currentChunk = '';
  }
  currentChunk += fileContent + '\n\n';
}

if (currentChunk.length > 0) {
  finalizeChunk(currentChunk, chunkIndex);
}
