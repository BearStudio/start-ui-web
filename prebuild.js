const dayjs = require('dayjs');
const fs = require('node:fs');

const generateAppBuild = () => {
  const getCommitHash = () => {
    try {
      return require('node:child_process')
        .execSync('git rev-parse HEAD')
        .toString()
        .trim();
    } catch {}
  };

  const commit = getCommitHash() ?? 'No commit id';
  const date = dayjs();

  const appBuildContent = {
    display: date.format('YYYY-MM-DD'),
    version: `${commit} - ${dayjs().format()}`,
    commit,
    date: date.format(),
  };

  fs.writeFileSync(
    './app-build.json',
    JSON.stringify(appBuildContent, null, 2)
  );
};

generateAppBuild();
