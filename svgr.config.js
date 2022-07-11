const template = require('./src/components/Icons/svgr-template');

module.exports = {
  icon: true,
  outDir: './src/components/Icons/icons-generated',
  expandProps: true,
  typescript: true,
  replaceAttrValues: { '#000': 'currentColor' },
  template,
};
