/* eslint-disable @typescript-eslint/no-var-requires */
const template = require('./svgr.template');

module.exports = {
  icon: true,
  outDir: './src/components/Icons/icons-generated',
  expandProps: true,
  typescript: true,
  replaceAttrValues: { '#000': 'currentColor' },
  template,
};
