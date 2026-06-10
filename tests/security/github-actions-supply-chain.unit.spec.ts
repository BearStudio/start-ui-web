/* oxlint-disable vitest/no-conditional-in-test -- Supply-chain policy tests branch over workflow metadata to collect exact violations. */

import { POSTGRES_TESTCONTAINER_IMAGE } from '@tests/server/docker-images';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const root = process.cwd();
const workflowRoot = path.join(root, '.github/workflows');
const digestPattern = /@sha256:[a-f0-9]{64}$/i;
const pinnedActionPattern = /^[^@\s]+@[a-f0-9]{40}$/i;
const allowedWritePermissions = new Set([
  '.github/workflows/codeql.yml:security-events',
  '.github/workflows/cosmos-pages.yml:id-token',
  '.github/workflows/cosmos-pages.yml:pages',
  '.github/workflows/osv-scanner.yml:security-events',
  '.github/workflows/supply-chain.yml:attestations',
  '.github/workflows/supply-chain.yml:id-token',
]);

type YamlRecord = Record<string, unknown>;

function asRecord(value: unknown): YamlRecord | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as YamlRecord)
    : undefined;
}

function workflowPaths() {
  return fs
    .readdirSync(workflowRoot)
    .filter((file) => /\.ya?ml$/.test(file))
    .sort()
    .map((file) => path.join('.github/workflows', file));
}

function readProjectFile(projectPath: string) {
  return fs.readFileSync(path.join(root, projectPath), 'utf8');
}

function parseYamlProjectFile(projectPath: string) {
  return parse(readProjectFile(projectPath)) as YamlRecord;
}

function workflowEntries() {
  return workflowPaths().map((projectPath) => ({
    projectPath,
    workflow: parseYamlProjectFile(projectPath),
  }));
}

function jobEntries(workflow: YamlRecord) {
  const jobs = asRecord(workflow.jobs) ?? {};
  return Object.entries(jobs).flatMap(([jobName, job]) => {
    const jobRecord = asRecord(job);
    return jobRecord ? [{ jobName, job: jobRecord }] : [];
  });
}

function stepEntries(projectPath: string, workflow: YamlRecord) {
  return jobEntries(workflow).flatMap(({ jobName, job }) => {
    const steps = Array.isArray(job.steps) ? job.steps : [];
    return steps.flatMap((step, index) => {
      const stepRecord = asRecord(step);
      return stepRecord
        ? [{ jobName, index, projectPath, step: stepRecord }]
        : [];
    });
  });
}

function collectYamlDockerImages(projectPath: string, workflow: YamlRecord) {
  return jobEntries(workflow).flatMap(({ jobName, job }) => {
    const images: Array<{ context: string; image: string }> = [];
    const container = job.container;
    if (typeof container === 'string') {
      images.push({
        context: `${projectPath}:jobs.${jobName}.container`,
        image: container,
      });
    } else {
      const containerImage = asRecord(container)?.image;
      if (typeof containerImage === 'string') {
        images.push({
          context: `${projectPath}:jobs.${jobName}.container.image`,
          image: containerImage,
        });
      }
    }

    const services = asRecord(job.services) ?? {};
    for (const [serviceName, service] of Object.entries(services)) {
      const image = asRecord(service)?.image;
      if (typeof image === 'string') {
        images.push({
          context: `${projectPath}:jobs.${jobName}.services.${serviceName}.image`,
          image,
        });
      }
    }

    return images;
  });
}

function collectDockerRunImages(projectPath: string, workflow: YamlRecord) {
  const dockerRunImagePattern =
    /^[a-z0-9][a-z0-9._/-]*(?::[a-z0-9._-]+)?(?:@sha256:[a-f0-9]{64})?$/i;
  const optionsWithValue = new Set([
    '-e',
    '-h',
    '-l',
    '-m',
    '-p',
    '-u',
    '-v',
    '-w',
    '--add-host',
    '--cidfile',
    '--cpuset-cpus',
    '--dns',
    '--dns-option',
    '--dns-search',
    '--entrypoint',
    '--env',
    '--env-file',
    '--expose',
    '--hostname',
    '--ip',
    '--label',
    '--label-file',
    '--link',
    '--log-driver',
    '--log-opt',
    '--memory',
    '--mount',
    '--name',
    '--network',
    '--network-alias',
    '--platform',
    '--pull',
    '--user',
    '--volume',
    '--volumes-from',
    '--workdir',
  ]);

  const collectShellCommands = (script: string) => {
    const commands: string[] = [];
    let currentCommand = '';

    for (const line of script.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const isContinued = trimmed.endsWith('\\');
      const segment = isContinued ? trimmed.slice(0, -1).trim() : trimmed;
      currentCommand = [currentCommand, segment].filter(Boolean).join(' ');

      if (!isContinued) {
        commands.push(currentCommand);
        currentCommand = '';
      }
    }

    if (currentCommand) commands.push(currentCommand);

    return commands;
  };

  const tokenizeShellCommand = (command: string) => {
    const tokens: string[] = [];
    let currentToken = '';
    let quote: '"' | "'" | undefined;
    let escaping = false;

    const pushCurrentToken = () => {
      if (!currentToken) return;

      tokens.push(currentToken);
      currentToken = '';
    };

    const isShellWhitespace = (char: string) =>
      char === ' ' || char === '\t' || char === '\n' || char === '\r';

    for (const char of command) {
      if (escaping) {
        currentToken += char;
        escaping = false;
        continue;
      }

      if (char === '\\' && quote !== "'") {
        currentToken += char;
        escaping = true;
        continue;
      }

      if ((char === '"' || char === "'") && !quote) {
        currentToken += char;
        quote = char;
        continue;
      }

      if (char === quote) {
        currentToken += char;
        quote = undefined;
        continue;
      }

      if (!quote && isShellWhitespace(char)) {
        pushCurrentToken();
        continue;
      }

      currentToken += char;
    }

    pushCurrentToken();

    return tokens;
  };

  const stripShellQuotes = (value: string) =>
    value.replace(/^(['"])(.*)\1$/, '$2');

  const dockerRunImageFromCommand = (command: string) => {
    const tokens = tokenizeShellCommand(command);
    if (tokens[0] !== 'docker' || tokens[1] !== 'run') return undefined;

    for (let index = 2; index < tokens.length; index += 1) {
      const token = stripShellQuotes(tokens[index] ?? '');

      if (token === '--') continue;
      if (token.startsWith('-')) {
        const [optionName = ''] = token.split('=', 1);
        if (!token.includes('=') && optionsWithValue.has(optionName)) {
          index += 1;
        }
        continue;
      }

      return dockerRunImagePattern.test(token) ? token : undefined;
    }

    return undefined;
  };

  return stepEntries(projectPath, workflow).flatMap(
    ({ jobName, index, step }) => {
      if (typeof step.run !== 'string') return [];

      return collectShellCommands(step.run).flatMap((command) => {
        const image = dockerRunImageFromCommand(command);
        return image
          ? [
              {
                context: `${projectPath}:jobs.${jobName}.steps.${index}.run`,
                image,
              },
            ]
          : [];
      });
    }
  );
}

describe('Docker run image collection', () => {
  it('extracts single-line and multiline docker run images without command false positives', () => {
    const images = collectDockerRunImages('workflow.yml', {
      jobs: {
        check: {
          steps: [
            {
              run: [
                'docker run --rm ghcr.io/acme/tool@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                'docker run \\',
                '  --rm \\',
                '  -v "$PWD:/work" \\',
                '  ghcr.io/acme/other@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb \\',
                '  bin/start',
                'npm run build',
              ].join('\n'),
            },
          ],
        },
      },
    });

    expect(images).toEqual([
      {
        context: 'workflow.yml:jobs.check.steps.0.run',
        image:
          'ghcr.io/acme/tool@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
      {
        context: 'workflow.yml:jobs.check.steps.0.run',
        image:
          'ghcr.io/acme/other@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      },
    ]);
  });

  it('collects bare docker images so they must also be digest-pinned', () => {
    const images = collectDockerRunImages('workflow.yml', {
      jobs: {
        check: {
          steps: [
            {
              run: 'docker run --rm alpine',
            },
          ],
        },
      },
    });

    expect(images).toEqual([
      {
        context: 'workflow.yml:jobs.check.steps.0.run',
        image: 'alpine',
      },
    ]);
  });

  it('tokenizes long escaped docker arguments without regex backtracking', () => {
    const escapedOptionValue = String.raw`\!`.repeat(1_000);
    const images = collectDockerRunImages('workflow.yml', {
      jobs: {
        check: {
          steps: [
            {
              run: `docker run --name "${escapedOptionValue}" alpine`,
            },
          ],
        },
      },
    });

    expect(images).toEqual([
      {
        context: 'workflow.yml:jobs.check.steps.0.run',
        image: 'alpine',
      },
    ]);
  });
});

function collectDockerComposeImages() {
  const composePath = 'docker-compose.yml';
  const compose = parseYamlProjectFile(composePath);
  const services = asRecord(compose.services) ?? {};

  return Object.entries(services).flatMap(([serviceName, service]) => {
    const image = asRecord(service)?.image;
    return typeof image === 'string'
      ? [{ context: `${composePath}:services.${serviceName}.image`, image }]
      : [];
  });
}

describe('GitHub Actions supply-chain policy', () => {
  it('requires SHA-pinned third-party actions', () => {
    const violations = workflowEntries().flatMap(
      ({ projectPath, workflow }) => {
        const stepViolations = stepEntries(projectPath, workflow).flatMap(
          ({ jobName, index, step }) => {
            if (typeof step.uses !== 'string' || step.uses.startsWith('./')) {
              return [];
            }

            if (step.uses.startsWith('docker://')) {
              return digestPattern.test(step.uses)
                ? []
                : [
                    `${projectPath}:jobs.${jobName}.steps.${index} uses ${step.uses}`,
                  ];
            }

            return pinnedActionPattern.test(step.uses)
              ? []
              : [
                  `${projectPath}:jobs.${jobName}.steps.${index} uses ${step.uses}`,
                ];
          }
        );

        const reusableWorkflowViolations = jobEntries(workflow).flatMap(
          ({ jobName, job }) => {
            if (typeof job.uses !== 'string' || job.uses.startsWith('./')) {
              return [];
            }

            return pinnedActionPattern.test(job.uses)
              ? []
              : [`${projectPath}:jobs.${jobName} uses ${job.uses}`];
          }
        );

        return [...stepViolations, ...reusableWorkflowViolations];
      }
    );

    expect(violations).toEqual([]);
  });

  it('forbids pull_request_target triggers', () => {
    const pullRequestTargetPattern = /^\s*pull_request_target\s*:/m;
    const violations = workflowPaths().flatMap((projectPath) =>
      pullRequestTargetPattern.test(readProjectFile(projectPath))
        ? [`${projectPath} uses pull_request_target`]
        : []
    );

    expect(violations).toEqual([]);
  });

  it('requires concurrency controls on every workflow', () => {
    const violations = workflowEntries().flatMap(({ projectPath, workflow }) =>
      asRecord(workflow.concurrency) ? [] : [projectPath]
    );

    expect(violations).toEqual([]);
  });

  it('requires checkout to avoid persisted GitHub credentials', () => {
    const violations = workflowEntries().flatMap(({ projectPath, workflow }) =>
      stepEntries(projectPath, workflow).flatMap(({ jobName, index, step }) => {
        if (
          typeof step.uses !== 'string' ||
          !step.uses.startsWith('actions/checkout@')
        ) {
          return [];
        }

        const persistCredentials = asRecord(step.with)?.['persist-credentials'];
        return persistCredentials === false || persistCredentials === 'false'
          ? []
          : [`${projectPath}:jobs.${jobName}.steps.${index}`];
      })
    );

    expect(violations).toEqual([]);
  });

  it('keeps write permissions limited to deployment and security upload scopes', () => {
    const violations: string[] = [];

    for (const { projectPath, workflow } of workflowEntries()) {
      const checkPermissions = (context: string, permissions: unknown) => {
        if (permissions === 'write-all') {
          violations.push(`${context} grants write-all`);
          return;
        }

        const permissionMap = asRecord(permissions);
        if (!permissionMap) return;

        for (const [permission, access] of Object.entries(permissionMap)) {
          if (
            access === 'write' &&
            !allowedWritePermissions.has(`${projectPath}:${permission}`)
          ) {
            violations.push(`${context} grants ${permission}: write`);
          }
        }
      };

      checkPermissions(`${projectPath}:permissions`, workflow.permissions);
      for (const { jobName, job } of jobEntries(workflow)) {
        checkPermissions(
          `${projectPath}:jobs.${jobName}.permissions`,
          job.permissions
        );
      }
    }

    expect(violations).toEqual([]);
  });

  it('requires Docker image references to be digest-pinned', () => {
    const workflowImages = workflowEntries().flatMap(
      ({ projectPath, workflow }) => [
        ...collectYamlDockerImages(projectPath, workflow),
        ...collectDockerRunImages(projectPath, workflow),
      ]
    );
    const images = [
      ...workflowImages,
      ...collectDockerComposeImages(),
      {
        context: 'tests/server/docker-images.ts:POSTGRES_TESTCONTAINER_IMAGE',
        image: POSTGRES_TESTCONTAINER_IMAGE,
      },
    ];

    const violations = images.flatMap(({ context, image }) =>
      digestPattern.test(image) ? [] : [`${context} uses ${image}`]
    );

    expect(violations).toEqual([]);
  });

  it('requires PostgreSQL readiness checks to use bounded retries', () => {
    const unboundedPostgresReadinessPattern =
      /until\s+docker\s+exec\s+postgres\s+pg_isready\b/;
    const violations = workflowEntries().flatMap(({ projectPath, workflow }) =>
      stepEntries(projectPath, workflow).flatMap(({ jobName, index, step }) =>
        typeof step.run === 'string' &&
        unboundedPostgresReadinessPattern.test(step.run)
          ? [
              `${projectPath}:jobs.${jobName}.steps.${index} uses an unbounded PostgreSQL readiness loop`,
            ]
          : []
      )
    );

    expect(violations).toEqual([]);
  });

  it('requires checksum verification for directly downloaded workflow CLIs', () => {
    const downloadPattern =
      /\b(?:curl|wget)\b(?=.*https?:\/\/)(?=.*\s(?:-o|-O)\s)/;
    const violations = workflowEntries().flatMap(({ projectPath, workflow }) =>
      stepEntries(projectPath, workflow).flatMap(({ jobName, index, step }) => {
        if (typeof step.run !== 'string') return [];

        const lines = step.run.split('\n');
        return lines.flatMap((line, lineIndex) => {
          if (!downloadPattern.test(line)) return [];

          const verificationWindow = lines
            .slice(lineIndex, lineIndex + 4)
            .join('\n');
          return /\bsha256sum\s+-c\b/.test(verificationWindow)
            ? []
            : [
                `${projectPath}:jobs.${jobName}.steps.${index} downloads without adjacent sha256sum verification`,
              ];
        });
      })
    );

    expect(violations).toEqual([]);
  });
});
