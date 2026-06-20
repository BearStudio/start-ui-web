import { existsSync } from 'node:fs';
import path from 'node:path';

const TRUSTED_UNIX_TOOL_DIRECTORIES = [
  '/usr/bin',
  '/bin',
  '/usr/sbin',
  '/sbin',
  '/opt/homebrew/bin',
  '/usr/local/bin',
] as const;

const TRUSTED_WINDOWS_TOOL_DIRECTORIES = [
  'C:\\Windows\\System32',
  'C:\\Program Files\\Git\\cmd',
  'C:\\Program Files\\Graphviz\\bin',
] as const;

const TOOL_NAME_PATTERN = /^[A-Za-z0-9._-]+$/;

export class TrustedToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrustedToolError';
  }
}

const trustedToolDirectories = () =>
  process.platform === 'win32'
    ? TRUSTED_WINDOWS_TOOL_DIRECTORIES
    : TRUSTED_UNIX_TOOL_DIRECTORIES;

const executableNamesForPlatform = (toolName: string) =>
  process.platform === 'win32' && !toolName.endsWith('.exe')
    ? [toolName, `${toolName}.exe`]
    : [toolName];

export const resolveTrustedTool = (toolName: string) => {
  if (
    !TOOL_NAME_PATTERN.test(toolName) ||
    toolName === '.' ||
    toolName === '..'
  ) {
    throw new TrustedToolError(`Invalid trusted tool name: ${toolName}`);
  }

  for (const directory of trustedToolDirectories()) {
    for (const executableName of executableNamesForPlatform(toolName)) {
      const candidate = path.join(directory, executableName);
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- Tool names are validated and directories are fixed above.
      if (existsSync(candidate)) return candidate;
    }
  }

  throw new TrustedToolError(
    `${toolName} was not found in trusted tool directories: ${trustedToolDirectories().join(
      ', '
    )}`
  );
};
