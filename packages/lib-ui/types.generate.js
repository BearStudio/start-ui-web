const dtsgen = require('react-to-typescript-definitions');
const { outputFile } = require('fs-extra');
const path = require('path');
const glob = require('glob');
function getModuleName(url) {
  return path.basename(url).replace('.js', '');
}
// Used to enhance the props interface inferred by adding generic HTML props
const EXTEND_PROPS_STRING = `Props {
    [key: string]: any;`;
const files = glob.sync('src/**/*.js');
const definitions = files.map((urlPath) => {
  const definition = dtsgen.generateFromFile(
    urlPath.replace('.js', ''),
    urlPath
  );
  return definition.replace('Props {', EXTEND_PROPS_STRING);
});
const mainModule = [
  'declare module "lib-ui" {',
  ...files.map((urlPath) => `    export {${getModuleName(
    urlPath
  )}} from "${urlPath.replace('.js', '')}"`),
  '}',
].join('\n');
outputFile(
  './dist/index.d.ts',
  `${mainModule}\n${definitions.join('')}`
);