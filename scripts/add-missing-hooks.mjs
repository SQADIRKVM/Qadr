#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '../src');
const HOOKS =
  '  const colors = useColors();\n  const styles = useThemedStyles(createStyles);\n';

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.tsx$/.test(ent.name)) files.push(p);
  }
  return files;
}

function addHooksToFile(content) {
  if (!content.includes('createStyles') || !content.includes('useColors')) {
    return content;
  }

  const lines = content.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    if (/^\}\)\s*=>\s*\{\s*$/.test(lines[i]) || /^\)\s*=>\s*\{\s*$/.test(lines[i])) {
      const look = lines.slice(i + 1, i + 12).join('\n');
      if (!look.includes('useThemedStyles(createStyles)')) {
        out.push(HOOKS.trimEnd());
      }
    }
    if (/^export function \w+/.test(lines[i])) {
      const next = lines[i + 1]?.trim();
      if (next === '{') {
        const look = lines.slice(i + 2, i + 12).join('\n');
        if (!look.includes('useThemedStyles(createStyles)')) {
          out.push(HOOKS.trimEnd());
        }
      }
    }
  }
  return out.join('\n');
}

for (const file of walk(SRC)) {
  let content = fs.readFileSync(file, 'utf8');
  const updated = addHooksToFile(content);
  if (updated !== content) {
    fs.writeFileSync(file, updated);
    console.log('hooks', path.relative(SRC, file));
  }
}
