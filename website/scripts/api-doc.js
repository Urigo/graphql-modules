/// @ts-check

const { tsquery } = require('@phenomnomnominal/tsquery');
const ts = require('typescript');
const globby = require('globby');
const path = require('path');
const fs = require('fs').promises;

const ID = 'api';
const TITLE = 'API Reference';
const DESCRIPTION = '';

async function main() {
  const files = await getFilesWithAPI();

  const blocks = await Promise.all(files.map(markdownAPI));

  const normalizedBlocks = []
    .concat(...blocks)
    .slice()
    .sort((a, b) => compare(a.identifier, b.identifier))
    .map((o) => o.content);

  const meta = ['---', `id: ${ID}`, `title: ${TITLE}`, '---'].join('\n');
  const markdown = [meta, DESCRIPTION, ...normalizedBlocks].join('\n\n');

  await fs.writeFile(path.resolve(__dirname, '../docs/api.md'), markdown, {
    encoding: 'utf-8',
  });
}

async function getFilesWithAPI() {
  const files = await globby('packages/graphql-modules/src/**/*.ts', {
    cwd: path.resolve(__dirname, '../../'),
    absolute: true,
    onlyFiles: true,
  });

  const contents = await Promise.all(
    files.map(async (filepath) => {
      const code = await fs.readFile(filepath, 'utf-8');

      if (code.includes('* @api')) {
        return {
          code,
          filepath,
        };
      }
    })
  );

  return contents.filter(Boolean);
}

/**
 * @param {{code: string; filepath: string;}} file
 * @returns {Promise<Array<{identifier: string; content: string}>>}
 */
async function markdownAPI(file) {
  const source = tsquery.ast(file.code, file.filepath, ts.ScriptKind.TS);

  const jsDocs = tsquery.query(source, 'JSDocComment', {
    visitAllChildren: true,
  });
  const docNodes = jsDocs
    .filter(ts.isJSDoc)
    .filter(
      (doc) => doc.tags && doc.tags.some((tag) => tag.tagName.text === 'api')
    );

  const blocks = docNodes.map((node) => {
    const parent = node.parent;
    const markdown = markdownBuilder(
      node,
      path.relative(path.resolve(__dirname, '../../'), file.filepath)
    );

    if (ts.isInterfaceDeclaration(parent)) {
      markdown.identifier(parent.name.text);

      parent.members.forEach((member) => {
        if (member.jsDoc) {
          /**
           * @type ts.JSDoc[]
           */
          const jsDoc = member.jsDoc;

          if (jsDoc && jsDoc[0]) {
            markdown.child(
              ts.getNameOfDeclaration(member).getText(),
              jsDoc[0].comment
            );
          }
        }
      });
    } else if (ts.isTypeAliasDeclaration(parent)) {
      markdown.identifier(parent.name.text);
      parent.type.members.forEach((member) => {
        if (member.jsDoc) {
          /**
           * @type ts.JSDoc[]
           */
          const jsDoc = member.jsDoc;

          if (jsDoc && jsDoc[0]) {
            markdown.child(
              ts.getNameOfDeclaration(member).getText(),
              jsDoc[0].comment
            );
          }
        }
      });
    } else if (ts.isVariableStatement(parent)) {
      markdown.identifier(
        parent.declarationList.declarations
          .find((declaration) => ts.isVariableDeclaration(declaration))
          .name.getText()
      );
    } else if (ts.isFunctionDeclaration(parent)) {
      markdown.identifier(parent.name.text);
    }

    return {
      identifier: markdown.getIdentifier(),
      content: markdown.print(),
    };
  });

  return blocks;
}

/**
 * @param {ts.JSDoc} node
 * @param {string} source
 */
function markdownBuilder(node, source) {
  /**
   * @type string[]
   */
  const children = [];

  const example = node.tags.find((tag) => tag.tagName.text === 'example');
  const description = node.tags.find((tag) => tag.tagName.text === 'api')
    .comment;

  /**
   * @type string
   */
  let identifier;

  return {
    /**
     * @param {string | null | undefined} id
     */
    identifier(id) {
      if (!id) {
        const comment = node.tags.find((tag) => tag.tagName.text === 'api')
          .comment;
        throw new Error(
          `Can't resolve parent token of JSDoc:

          ${comment}
        `
        );
      }

      identifier = id;
    },
    /**
     * @param {string} name
     * @param {string} comment
     */
    child(name, comment) {
      children.push(` - \`${name}\` - ${comment}`);
    },
    getIdentifier() {
      return identifier;
    },
    print() {
      return [
        `## ${identifier}`,
        `[_source file_](https://github.com/Urigo/graphql-modules/blob/master/${source})`,
        '',
        description,
        '',
        ...children,
        '',
        example ? supportDecorators(example.comment) : '',
      ].join('\n');
    },
  };
}

/**
 *
 * @param {string} code
 * @returns {string}
 */
function supportDecorators(code) {
  return code.replace(/\(A\)/g, '@');
}

/**
 * @param {string} val
 * @returns {boolean}
 */
function isCapitalOnly(val) {
  return /^[A-Z\_]+$/.test(val);
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function compare(a, b) {
  const aNorm = a.toLowerCase();
  const bNorm = b.toLowerCase();
  const alpha = aNorm < bNorm ? -1 : aNorm > bNorm ? 1 : 0;
  const aCap = isCapitalOnly(a);
  const bCap = isCapitalOnly(b);

  if (aCap && bCap) {
    return alpha;
  }

  if (aCap) {
    return -1;
  }

  if (bCap) {
    return 1;
  }

  return alpha;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
