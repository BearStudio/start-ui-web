module.exports = {
  description: 'Component Story Generator',
  prompts: [
    {
      type: 'fuzzypath',
      message: 'Component name for story',
      name: 'path',
      rootPath: 'src',
      itemType: 'file',
      excludeFilter: (nodePath) =>
        !nodePath.endsWith('.tsx') || nodePath.endsWith('.stories.tsx'),
    },
  ],
  actions: [
    {
      type: 'add',
      path: 'src/{{getFolder path}}/docs.stories.tsx',
      templateFile: 'generators/story/docs.stories.tsx.hbs',
    },
  ],
};
