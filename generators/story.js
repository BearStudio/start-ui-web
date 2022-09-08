module.exports = {
  description: 'Component Story Generator',
  prompts: [
    {
      type: 'fuzzypath',
      message: 'Component name for story',
      name: 'path',
      rootPath: 'src',
      itemType: 'file',
    },
  ],
  actions: [
    {
      type: 'add',
      path: 'src/{{getFolder path}}/docs.stories.tsx',
      templateFile: 'generators/docs.stories.tsx.hbs',
    },
  ],
};
