import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

type YamlRecord = Record<string, unknown>;

const asRecord = (value: unknown): YamlRecord | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as YamlRecord)
    : undefined;

function readAffectedTestWorkflowSteps() {
  const workflow = parse(
    fs.readFileSync(
      path.join(process.cwd(), '.github/workflows/code-quality.yml'),
      'utf8'
    )
  ) as YamlRecord;
  const jobs = asRecord(workflow.jobs) ?? {};
  const job = asRecord(jobs['affected-tests']);
  if (!job) throw new Error('Expected affected-tests job to be defined.');
  const { steps } = job;
  if (!Array.isArray(steps)) {
    throw new Error('Expected affected-tests job steps to be an array.');
  }

  return steps.flatMap((step) => {
    const stepRecord = asRecord(step);
    return stepRecord ? [stepRecord] : [];
  });
}

function findStepByName(steps: YamlRecord[], name: string) {
  const step = steps.find((candidate) => candidate.name === name);
  if (!step) throw new Error(`Expected workflow step "${name}" to exist.`);
  return step;
}

function findCheckoutStep(steps: YamlRecord[]) {
  const step = steps.find(
    (candidate) =>
      typeof candidate.uses === 'string' &&
      candidate.uses.startsWith('actions/checkout@')
  );
  if (!step) throw new Error('Expected checkout step to exist.');
  return step;
}

describe('affected test workflow job', () => {
  it('resolves a base SHA and passes it to pnpm test:affected', () => {
    const steps = readAffectedTestWorkflowSteps();

    const checkoutStep = findCheckoutStep(steps);
    expect(asRecord(checkoutStep.with)?.['fetch-depth']).toBe(0);

    const baseStep = findStepByName(steps, 'Resolve affected test base');
    expect(baseStep.id).toBe('affected-test-base');
    expect(String(baseStep.run)).toContain('PULL_REQUEST_BASE_SHA');
    expect(String(baseStep.run)).toContain('PUSH_BEFORE_SHA');
    expect(String(baseStep.run)).toContain('base_sha=');

    const runStep = findStepByName(steps, 'Run affected tests');
    expect(runStep.run).toBe(
      'pnpm test:affected --base "${{ steps.affected-test-base.outputs.base_sha }}"'
    );
  });
});
