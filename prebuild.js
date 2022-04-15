const dayjs = require('dayjs');
const fs = require('fs');

const generateAppBuild = () => {
  const getCommitHash = () => {
    try {
      return require('child_process')
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
