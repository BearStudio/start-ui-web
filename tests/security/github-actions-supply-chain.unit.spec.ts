import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import { POSTGRES_TESTCONTAINER_IMAGE } from '@tests/server/docker-images';

const root = process.cwd();
const workflowRoot = path.join(root, '.github/workflows');
const digestPattern = /@sha256:[a-f0-9]{64}$/i;
const pinnedActionPattern = /^[^@\s]+@[a-f0-9]{40}$/i;
const allowedWritePermissions = new Set([
  '.github/workflows/codeql.yml:security-events',
  '.github/workflows/cosmos-pages.yml:id-token',
  '.github/workflows/cosmos-pages.yml:pages',
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

  return stepEntries(projectPath, workflow).flatMap(
    ({ jobName, index, step }) => {
      if (typeof step.run !== 'string') return [];

      let insideDockerRun = false;
      const images: Array<{ context: string; image: string }> = [];
      const lines = step.run.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (/^docker\s+run\b/.test(trimmed)) {
          insideDockerRun = true;
          continue;
        }

        if (!insideDockerRun) continue;

        const image = trimmed.replace(/\s*\\$/, '');
        if (
          dockerRunImagePattern.test(image) &&
          (image.includes('/') || image.includes(':'))
        ) {
          images.push({
            context: `${projectPath}:jobs.${jobName}.steps.${index}.run`,
            image,
          });
        }

        if (!trimmed.endsWith('\\')) insideDockerRun = false;
      }

      return images;
    }
  );
}

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
    const violations = workflowEntries().flatMap(({ projectPath, workflow }) =>
      stepEntries(projectPath, workflow).flatMap(({ jobName, index, step }) => {
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
          : [`${projectPath}:jobs.${jobName}.steps.${index} uses ${step.uses}`];
      })
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
