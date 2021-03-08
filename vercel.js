const dayjs = require('dayjs');
const fs = require('fs');

const generateAppBuild = () => {
  const getCommitHash = () =>
    require('child_process').execSync('git rev-parse HEAD').toString().trim();

  const commit = process.env.VERCEL_GIT_COMMIT_SHA
    ? process.env.VERCEL_GIT_COMMIT_SHA
    : getCommitHash();

  const appBuildContent = {
    display: `${dayjs().format('YYYY-MM-DD')}`,
    version: `${commit} - ${dayjs().format()}`,
    commit,
    date: dayjs().format(),
  };

  fs.writeFileSync(
    './app-build.json',
    JSON.stringify(appBuildContent, null, 2)
  );
};

generateAppBuild();
