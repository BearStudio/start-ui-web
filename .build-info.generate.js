const dayjs = require('dayjs');
const fs = require('fs');

const getContent = () => {
  const getCommitHashShort = () =>
    require('child_process')
      .execSync('git rev-parse --short HEAD')
      .toString()
      .trim();

  const getCommitHash = () =>
    require('child_process').execSync('git rev-parse HEAD').toString().trim();

  return {
    display: getCommitHashShort(),
    version: `${getCommitHashShort()} - ${dayjs().format()}`,
    commit: getCommitHash(),
    date: dayjs().format(),
  };
};

const generateAppBuild = () => {
  try {
    fs.writeFileSync(
      './.build-info.json',
      JSON.stringify(getContent(), null, 2)
    );
    console.log('✅ Generate `.build-info.json`');
  } catch (error) {
    console.error(error);
    throw new Error('❌ Failed to generate `.build-info.json`');
  }
};

generateAppBuild();
