import dayjs from 'dayjs';
import childProcess from 'node:child_process';
import fs from 'node:fs';

import { AppError } from '@/modules/kernel/domain/errors/app-error';

const getContent = () => {
  const getCommitHashShort = () => {
    try {
      return (
        childProcess
          // eslint-disable-next-line sonarjs/no-os-command-from-path
          .execSync('git rev-parse --short HEAD')
          .toString()
          .trim()
      );
    } catch {
      return null;
    }
  };

  const getCommitHash = () => {
    try {
      // eslint-disable-next-line sonarjs/no-os-command-from-path
      return childProcess.execSync('git rev-parse HEAD').toString().trim();
    } catch {
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

const generatedPath = './src/app/build-info/presentation/build-info.gen.json';

const generateAppBuild = () => {
  try {
    fs.writeFileSync(generatedPath, JSON.stringify(getContent(), null, 2));
    console.log(`✅ Build info file generated (${generatedPath})`);
  } catch (error) {
    console.error(error);
    throw new AppError({
      code: 'BUILD_INFO_GENERATE_FAILED',
      category: 'system',
      status: 500,
      message: `Failed to generate build info file (${generatedPath})`,
      cause: error,
    });
  }
};

generateAppBuild();
