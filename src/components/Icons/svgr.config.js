/* eslint-disable @typescript-eslint/no-var-requires */
const template = require('./svgr.template');

module.exports = {
  icon: true,
  outDir: './src/components/Icons/icons-generated',
  expandProps: true,
  typescript: true,
  replaceAttrValues: { '#000': 'currentColor' },
  template,

  // Prevent svgr + prettier 3 compatibility issue
  // It is ok to disable it here, every generated file is tracked
  // with git and will be formated on push thanks to lint-staged + prettier
  // See https://github.com/gregberge/svgr/issues/893 for details on the underlying issue
  prettier: false,
};
