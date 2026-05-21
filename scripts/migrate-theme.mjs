#!/usr/bin/env node
/**
 * Migrates components from static theme/colors to useColors + useThemedStyles.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '../src');

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== 'theme' && ent.name !== '__tests__') {
      walk(p, files);
    } else if (ent.isFile() && /\.(tsx|ts)$/.test(ent.name)) {
      files.push(p);
    }
  }
  return files;
}

function themeImportPath(filePath) {
  const rel = path.relative(path.dirname(filePath), path.join(SRC, 'theme'));
  const normalized = rel.split(path.sep).join('/');
  const prefix = normalized.startsWith('.') ? normalized : `./${normalized}`;
  return prefix.replace(/\/$/, '') || '.';
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('theme/colors')) return false;
  if (content.includes('useColors')) return false;
  if (filePath.includes(`${path.sep}theme${path.sep}`)) return false;

  const themePath = themeImportPath(filePath);
  const isTsx = filePath.endsWith('.tsx');

  content = content.replace(
    /import\s*{\s*colors\s*}\s*from\s*['"][^'"]*theme\/colors['"];?\r?\n?/g,
    '',
  );

  // glass / patterns static imports → remove; call as functions with colors in JSX
  const hadGlassBase = /import\s*{\s*([^}]*\bglassCardBase\b[^}]*)\}\s*from\s*['"][^'"]*theme\/glass['"]/.test(
    content,
  );
  const hadGlassDeep = content.includes('glassCardDeep');
  const hadGlassModal = content.includes('glassModalSurface');
  const hadGhost = content.includes('ghostHighlight');

  content = content.replace(
    /import\s*{\s*([^}]*)\}\s*from\s*['"][^'"]*theme\/glass['"];?\r?\n?/g,
    (match, imports) => {
      const names = imports.split(',').map((s) => s.trim());
      const fnImports = names.filter((n) =>
        ['glassCardBase', 'glassCardDeep', 'glassModalSurface'].includes(n),
      );
      if (fnImports.length === 0) return '';
      return `import { ${fnImports.join(', ')} } from '${themePath}/glass';\n`;
    },
  );

  content = content.replace(
    /import\s*{\s*([^}]*)\}\s*from\s*['"][^'"]*theme\/patterns['"];?\r?\n?/g,
    (match, imports) => {
      const names = imports.split(',').map((s) => s.trim());
      const fnImports = names.filter((n) =>
        ['ghostHighlight', 'dotMatrixDotColor'].includes(n),
      );
      if (fnImports.length === 0) return '';
      return `import { ${fnImports.join(', ')} } from '${themePath}/patterns';\n`;
    },
  );

  const themeImports = [
    `import { useColors } from '${themePath}/ThemeContext';`,
    isTsx ? `import { useThemedStyles } from '${themePath}/useThemedStyles';` : '',
    isTsx ? `import type { ColorPalette } from '${themePath}/palettes';` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const lastImport = content.lastIndexOf('\nimport ');
  const insertAt =
    lastImport >= 0
      ? content.indexOf('\n', lastImport + 1) + 1
      : content.indexOf('\n') + 1;
  content = content.slice(0, insertAt) + themeImports + '\n' + content.slice(insertAt);

  if (isTsx && content.includes('StyleSheet.create')) {
    content = content.replace(
      /const\s+styles\s*=\s*StyleSheet\.create\(/g,
      'const createStyles = (colors: ColorPalette) => StyleSheet.create(',
    );
  }

  // glass/pattern usages
  if (hadGlassBase) {
    content = content.replace(/\bglassCardBase\b(?!\.|\()/g, 'glassCardBase(colors)');
  }
  if (hadGlassDeep) {
    content = content.replace(/\bglassCardDeep\b(?!\.|\()/g, 'glassCardDeep(colors)');
  }
  if (hadGlassModal) {
    content = content.replace(/\bglassModalSurface\b(?!\.|\()/g, 'glassModalSurface(colors)');
  }
  if (hadGhost) {
    content = content.replace(/\bghostHighlight\b(?!\.|\()/g, 'ghostHighlight(colors)');
  }
  if (content.includes('dotMatrixDotColor')) {
    content = content.replace(
      /\bdotMatrixDotColor\b(?!\.|\()/g,
      'dotMatrixDotColor(colors)',
    );
  }

  if (!isTsx) {
    content = content.replace(/\bcolors\./g, 'darkColors.');
    if (!content.includes('darkColors')) {
      content = content.replace(
        themeImports,
        `import { darkColors } from '${themePath}/palettes';\n${themeImports}`,
      );
    }
    fs.writeFileSync(filePath, content);
    return true;
  }

  const hookBlock =
    '  const colors = useColors();\n' +
    (content.includes('createStyles') ? '  const styles = useThemedStyles(createStyles);\n' : '');

  const patterns = [
    /(export const \w+[^=]*=\s*\([^)]*\)\s*=>\s*\{)/,
    /(export const \w+[^=]*=\s*\(\)\s*=>\s*\{)/,
    /(export function \w+\([^)]*\)\s*\{)/,
  ];

  let inserted = false;
  for (const pat of patterns) {
    if (pat.test(content) && !content.includes('const colors = useColors()')) {
      content = content.replace(pat, `$1\n${hookBlock}`);
      inserted = true;
      break;
    }
  }

  if (!inserted && content.includes('colors.')) {
    // fallback: first function body
    content = content.replace(/(\) => \{\n)/, `$1${hookBlock}`);
  }

  fs.writeFileSync(filePath, content);
  return true;
}

const files = walk(SRC);
let count = 0;
for (const f of files) {
  if (migrateFile(f)) {
    count++;
    console.log('migrated', path.relative(SRC, f));
  }
}
console.log(`Done: ${count} files`);
