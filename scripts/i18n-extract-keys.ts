import * as fs from 'fs';
import { glob } from 'glob';
import * as path from 'path';
import * as ts from 'typescript';

const KEY_PREFIX = 'TODO: ';

const getSourceFile = (filePath: string) => {
  const sourceCode = fs.readFileSync(filePath, 'utf8');
  return ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
};

const getI18nKeys = (sourceFile: ts.SourceFile) => {
  const keys = new Set<string>();

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 't' &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      const key = node.arguments[0].text;
      keys.add(key);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return [...keys];
};

const cleanDeep = (obj: any) => {
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    } else if (typeof obj[propName] === 'object') {
      cleanDeep(obj[propName]);
    } else if (typeof obj[propName] !== 'string') {
      delete obj[propName];
    }
  }
  return obj;
};

const updateNamespaceFile = (
  filePath: string,
  allKeys: Record<string, any>
) => {
  const oldFilePath = filePath.replace('.json', '_old.json');
  const fileToRead = fs.existsSync(oldFilePath) ? oldFilePath : filePath;

  const currentTranslations = fs.existsSync(fileToRead)
    ? cleanDeep(JSON.parse(fs.readFileSync(fileToRead, 'utf-8')))
    : {};

  const fileKeys = allKeys[path.basename(filePath, '.json')] ?? {};

  const newTranslations = JSON.parse(JSON.stringify(fileKeys)); // deep clone

  const merge = (target: any, source: any) => {
    for (const key in target) {
      if (source?.[key]) {
        if (
          typeof target[key] === 'object' &&
          typeof source[key] === 'object'
        ) {
          merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      } else {
        if (typeof target[key] === 'object') {
          merge(target[key], {});
        } else {
          target[key] = `${KEY_PREFIX}${key}`;
        }
      }
    }
  };

  const unflattenedKeys = Object.keys(fileKeys).reduce(
    (acc, key) => {
      const keyParts = key.split('.');
      let currentLevel = acc;
      keyParts.forEach((part, index) => {
        if (index === keyParts.length - 1) {
          currentLevel[part] = '';
        } else {
          currentLevel[part] = currentLevel[part] ?? {};
          currentLevel = currentLevel[part];
        }
      });
      return acc;
    },
    {} as Record<string, any>
  );

  merge(unflattenedKeys, currentTranslations);

  fs.writeFileSync(filePath, JSON.stringify(unflattenedKeys, null, 2));
};

const run = async () => {
  const files = await glob('src/**/*.{ts,tsx}');

  const allKeys = files.reduce(
    (acc, file) => {
      const sourceFile = getSourceFile(file);
      const keys = getI18nKeys(sourceFile);
      keys.forEach((key) => {
        const [namespace, ...rest] = key.split(':');
        const cleanKey = rest.join(':');
        if (!acc[namespace]) {
          acc[namespace] = {};
        }
        acc[namespace][cleanKey] = '';
      });
      return acc;
    },
    {} as Record<string, Record<string, string>>
  );

  const locales = fs.readdirSync('src/locales');
  locales.forEach((locale) => {
    if (locale === 'index.ts' || locale.endsWith('_old.json')) return;
    const localeDir = path.join('src/locales', locale);
    if (fs.statSync(localeDir).isDirectory()) {
      const namespaces = fs.readdirSync(localeDir);
      namespaces.forEach((namespaceFile) => {
        if (
          namespaceFile.endsWith('.json') &&
          !namespaceFile.endsWith('_old.json')
        ) {
          const namespaceFilePath = path.join(localeDir, namespaceFile);
          updateNamespaceFile(namespaceFilePath, allKeys);
        }
      });
    }
  });

  console.log('✅ i18n keys extracted and merged successfully.');
};

run();
