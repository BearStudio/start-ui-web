const dayjs = require('dayjs');
const fs = require('fs');

const getContent = () => {
  const getCommitHashShort = () => {
    try {
      return require('child_process')
        .execSync('git rev-parse --short HEAD')
        .toString()
        .trim();
    } catch (error) {
      return null;
    }
  };

  const getCommitHash = () => {
    try {
      return require('child_process')
        .execSync('git rev-parse HEAD')
        .toString()
        .trim();
    } catch (error) {
      return null;
    }
  };

  return {
    display: getCommitHashShort() ?? dayjs().format('YYYY-MM-DD'),
    version: `${getCommitHashShort() ?? 'No commit'} - ${dayjs().format()}`,
    commit: getCommitHash() ?? 'No commit',
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
