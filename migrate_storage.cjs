const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://yrdkmbndccaaptchqiyl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZGttYm5kY2NhYXB0Y2hxaXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzE2MzEsImV4cCI6MjA5MDE0NzYzMX0.GdSFYce6fmSIAG7jrEySF3j4bM8ZVfXpGauAyiOqVMg';

const STORAGE_ROOT = 'storage_unzipped/owvwqdcgtpngbtfdkhwt';

const MAPPING = {
  'client-profiles': 'avatars',
  'review-profiles': 'avatars',
  'gallery-images': 'gallery-media',
  'gallery': 'gallery-media',
  'license-images': 'gallery-media'
};

async function uploadFile(filePath, bucket, targetPath) {
  const fileBuffer = fs.readFileSync(filePath);
  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${targetPath}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': getContentType(filePath),
        'x-upsert': 'true'
      },
      body: fileBuffer
    });

    const result = await response.json();
    if (!response.ok) {
      console.error(`Error uploading ${filePath}:`, result.message || response.statusText);
    } else {
      console.log(`Uploaded ${filePath} -> ${bucket}/${targetPath}`);
    }
  } catch (error) {
    console.error(`Network error for ${filePath}:`, error.message);
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}

async function walk(dir, bucket, prefix = '') {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const targetPath = prefix ? `${prefix}/${file}` : file;
    if (fs.statSync(fullPath).isDirectory()) {
      await walk(fullPath, bucket, targetPath);
    } else {
      await uploadFile(fullPath, bucket, targetPath);
    }
  }
}

async function main() {
  for (const [srcDir, targetBucket] of Object.entries(MAPPING)) {
    const fullSrcDir = path.join(STORAGE_ROOT, srcDir);
    if (fs.existsSync(fullSrcDir)) {
      console.log(`Starting migration for ${srcDir} -> ${targetBucket}...`);
      await walk(fullSrcDir, targetBucket, srcDir);
    }
  }
}

main().catch(console.error);
