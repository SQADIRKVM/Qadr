#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '../src');

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.tsx$/.test(ent.name)) files.push(p);
  }
  return files;
}

const HOOKS =
  '  const colors = useColors();\n  const styles = useThemedStyles(createStyles);\n';

function stripMisplacedHooks(content) {
  return content.replace(
    /(=> \{\s*\n)\s*const colors = useColors\(\);\s*\n\s*const styles = useThemedStyles\(createStyles\);\s*\n/g,
    '$1',
  );
}

function convertParenComponents(content) {
  // export const Foo ... = (...) => (  → block with hooks + return
  const re =
    /(export const (\w+)(?:: React\.FC[^=]*)? = \([^)]*\) => )\(/g;
  let result = content;
  let match;
  const inserts = [];
  while ((match = re.exec(content)) !== null) {
    if (content.slice(0, match.index).includes(`const ${match[2]} =`)) continue;
    inserts.push({ index: match.index + match[1].length, name: match[2] });
  }
  // process from end to preserve indices
  inserts.reverse();
  for (const { index } of inserts) {
    const before = result.slice(0, index);
    const after = result.slice(index);
    if (before.includes('useThemedStyles(createStyles)') && before.lastIndexOf('export const') < before.lastIndexOf('useThemedStyles')) {
      continue;
    }
    result = before + '{\n' + HOOKS + 'return (' + after;
    // find matching close for this component: );\n); at end - fragile
  }
  return result;
}

function closeParenComponents(content) {
  // Fix: export const X = () => { hooks return ( ... );  needs }; not );
  // Replace pattern `);\n);` at component end when we added return (
  return content;
}

function ensureHooksInBlockComponents(content) {
  if (!content.includes('createStyles')) return content;
  if (!content.includes('useThemedStyles')) return content;

  const lines = content.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^export const (\w+).*=> \{$/);
    if (m) {
      out.push(line);
      i++;
      const next = lines[i] ?? '';
      if (!next.includes('useColors()')) {
        out.push(HOOKS.trimEnd());
      }
      continue;
    }
    const m2 = line.match(/^export function (\w+)/);
    if (m2) {
      out.push(line);
      i++;
      if (lines[i]?.trim() === '{') {
        out.push(lines[i]);
        i++;
        if (!(lines[i] ?? '').includes('useColors()')) {
          out.push(HOOKS.trimEnd());
        }
      }
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join('\n');
}

function fixImplicitReturnComponents(content) {
  // export const X = (props) => (  →  export const X = (props) => {\n hooks\n return (
  return content.replace(
    /(export const \w+(?:: React\.FC<[^>]+>)? = \([^)]*\) => )\(/g,
    (full, prefix) => {
      const segment = content.slice(0, content.indexOf(full));
      if (segment.includes(prefix + '{')) return full;
      return `${prefix}{\n${HOOKS}return (`;
    },
  );
}

function fixImplicitReturnClosing(content) {
  // After "return (", the component ends with );\n);  before next export or const createStyles
  // Change standalone ); that closes component from ); to );\n};
  // Match: \n);\n\n(const createStyles|export |interface )
  return content.replace(/\n\);\n(\n(?:const createStyles|export |interface ))/g, '\n);\n}\n$1');
}

for (const file of walk(SRC)) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('createStyles')) continue;
  const orig = content;
  content = stripMisplacedHooks(content);
  content = fixImplicitReturnComponents(content);
  content = fixImplicitReturnClosing(content);
  content = ensureHooksInBlockComponents(content);
  if (content !== orig) {
    fs.writeFileSync(file, content);
    console.log('fixed', path.relative(SRC, file));
  }
}
