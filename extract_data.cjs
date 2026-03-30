const fs = require('fs');
const path = require('path');

const inputFile = 'db_backup.sql';
const targetTables = [
    'auth.users',
    'auth.identities',
    'public.profiles',
    'public.license_types',
    'public.reviews',
    'public.testimonials',
    'public.gallery',
    'public.gallery_media',
    'public.document_types',
    'public.clients',
    'public.contact_messages'
];

function escapeSQL(val) {
    if (val === '\\N') return 'NULL';
    // Remove surroundings if it's already quoted or handle internal quotes
    let escaped = val.replace(/'/g, "''");
    return `'${escaped}'`;
}

function parseCopyData(lines, startIndex, tableName, columns) {
    const data = [];
    let i = startIndex + 1;
    while (i < lines.length && lines[i].trim() !== '\\.') {
        const line = lines[i];
        if (line.trim() === '') {
            i++;
            continue;
        }
        const values = line.split('\t').map(v => escapeSQL(v));
        data.push(`(${values.join(', ')})`);
        i++;
    }
    
    if (data.length === 0) return null;

    const columnStr = columns ? `(${columns})` : '';
    return `INSERT INTO ${tableName} ${columnStr} VALUES\n${data.join(',\n')};\n`;
}

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

let outputSql = '-- Data Migration Script\n';
outputSql += 'BEGIN;\n';
outputSql += 'SET session_replication_role = \'replica\'; -- Disable triggers and constraints during migration\n\n';

const userEmails = {};

// First pass to get emails
for (let i = 0; i < lines.length; i++) {
    const line = [lines[i].trim()];
    if (line[0].startsWith('COPY auth.users ')) {
        const columnsMatch = lines[i].match(/\((.*)\)/);
        const columns = columnsMatch ? columnsMatch[1].split(',').map(c => c.trim()) : [];
        const emailIdx = columns.indexOf('email');
        const idIdx = columns.indexOf('id');
        
        let j = i + 1;
        while (j < lines.length && lines[j].trim() !== '\\.') {
            const dataLine = lines[j];
            if (dataLine.trim() !== '') {
                const values = dataLine.split('\t');
                if (idIdx !== -1 && emailIdx !== -1) {
                    userEmails[values[idIdx]] = values[emailIdx];
                }
            }
            j++;
        }
    }
}

for (let i = 0; i < lines.length; i++) {
    for (const table of targetTables) {
        if (lines[i].startsWith(`COPY ${table} `)) {
            console.log(`Found data for ${table} at line ${i + 1}`);
            const columnsMatch = lines[i].match(/\((.*)\)/);
            let currentColumns = columnsMatch ? columnsMatch[1] : null;
            
            let data = [];
            let j = i + 1;
            while (j < lines.length && lines[j].trim() !== '\\.') {
                const dataLine = lines[j];
                if (dataLine.trim() === '') { j++; continue; }
                let values = dataLine.split('\t');
                
                if (table === 'public.profiles') {
                    const id = values[0]; 
                    const email = userEmails[id] || '\\N';
                    const colsArr = currentColumns.split(',').map(c => c.trim());
                    if (!colsArr.includes('email')) {
                        colsArr.push('email');
                        currentColumns = colsArr.join(', ');
                        values.push(email);
                    }
                }
                
                const escapedValues = values.map(v => escapeSQL(v));
                data.push(`(${escapedValues.join(', ')})`);
                j++;
            }
            
            if (data.length > 0) {
                outputSql += `-- Table: ${table}\n`;
                outputSql += `INSERT INTO ${table} (${currentColumns}) VALUES\n${data.join(',\n')};\n\n`;
            }
        }
    }
}

outputSql += 'SET session_replication_role = \'origin\';\n';
outputSql += 'COMMIT;\n';

fs.writeFileSync('data_migration.sql', outputSql);
console.log('Generated data_migration.sql');
