/* eslint-disable @typescript-eslint/no-var-requires */
const inquirerFuzzyPath = require('inquirer-fuzzy-path');
const storyGenerator = require('./generators/story');

module.exports = function (plop) {
  plop.setGenerator('stories', storyGenerator);

  //#region  //*=========== Handlebars Helper ===========
  /**
   * Generate story component route
   * @see https://stackoverflow.com/questions/41490076/capitalize-every-letter-after-and-characters
   */
  plop.setHelper('directoryCase', function (title) {
    return title.replace(/(^|\/|-)(\S)/g, (s) => s.toUpperCase());
  });

  /**
   * Remove 'src', and file name from path
   */
  plop.setHelper('getFolder', (path) => {
    const split = path.split('/');
    // remove filename
    split.pop();
    if (split[0] === 'src') split.splice(0, 1);
    return split.join('/');
  });

  /**
   * Remove file name from path and get the parent folder name
   */
  plop.setHelper('getName', (path) => {
    const split = path.split('/');
    // remove filename
    split.pop();
    // get the parent folder name
    return split.pop();
  });
  //#endregion  //*======== Handlebars Helper ===========

  //#region  //*=========== Inquirer Prompt ===========
  plop.setPrompt('fuzzypath', inquirerFuzzyPath);
  //#endregion  //*======== Inquirer Prompt ===========
};
