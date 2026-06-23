import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  ARTIFACT_FILENAMES,
  buildModuleLayerGraph,
  compareArtifactDirectories,
  createCheckedGraphArtifacts,
  type DependencyCruiserReport,
  formatDot,
  formatMarkdown,
  formatMermaid,
  getDependencyStyle,
  groupModulePath,
} from '../../../scripts/generate-module-dependency-graph';

describe('module dependency graph path grouping', () => {
  it('groups module internals by layer and public gate files as public', () => {
    expect(groupModulePath('src/modules/book/domain/book.ts')).toEqual({
      id: 'book/domain',
      layerName: 'domain',
      moduleName: 'book',
    });
    expect(
      groupModulePath('src/modules/auth/infrastructure/drizzle/schema.ts')
    ).toEqual({
      id: 'auth/infrastructure',
      layerName: 'infrastructure',
      moduleName: 'auth',
    });
    expect(groupModulePath('src/modules/user/presentation.ts')).toEqual({
      id: 'user/public',
      layerName: 'public',
      moduleName: 'user',
    });
    expect(groupModulePath('src/platform/components/button.tsx')).toBe(
      undefined
    );
  });
});

describe('module dependency graph edge styles', () => {
  it('classifies dependency-cruiser dependency types into graph styles', () => {
    expect(getDependencyStyle({ dependencyTypes: ['local', 'import'] })).toBe(
      'solid'
    );
    expect(
      getDependencyStyle({ dependencyTypes: ['local', 'dynamic-import'] })
    ).toBe('dashed');
    expect(
      getDependencyStyle({ dependencyTypes: ['type-only', 'import'] })
    ).toBe('dashed');
    expect(getDependencyStyle({ dependencyTypes: ['local', 'export'] })).toBe(
      'dotted'
    );
  });
});

describe('module dependency graph builder', () => {
  it('deduplicates file dependencies into sorted layer edges and hides self edges', () => {
    const report: DependencyCruiserReport = {
      modules: [
        {
          dependencies: [
            {
              dependencyTypes: ['local', 'import'],
              resolved: 'src/modules/book/domain/book.ts',
            },
            {
              dependencyTypes: ['local', 'import'],
              resolved: 'src/modules/book/domain/book-policy.ts',
            },
            {
              dependencyTypes: ['local', 'dynamic-import'],
              resolved: 'src/modules/auth/client.ts',
            },
            {
              dependencyTypes: ['local', 'import'],
              resolved: 'src/modules/book/presentation/book-cover.tsx',
            },
          ],
          source: 'src/modules/book/presentation/page-book.tsx',
        },
        {
          dependencies: [
            {
              dependencyTypes: ['local', 'export'],
              resolved: 'src/modules/book/domain/book.ts',
            },
          ],
          source: 'src/modules/book/index.ts',
        },
        {
          dependencies: [
            {
              dependencyTypes: ['local', 'export'],
              resolved: 'src/modules/kernel/domain/errors/app-error.ts',
            },
            {
              dependencyTypes: ['local', 'import'],
              resolved: 'src/modules/kernel/domain/ids.ts',
            },
          ],
          source: 'src/modules/auth/application/use-cases/get-session.ts',
        },
      ],
    };

    expect(buildModuleLayerGraph(report)).toEqual({
      edges: [
        {
          from: 'auth/application',
          style: 'solid',
          to: 'kernel/domain',
        },
        {
          from: 'book/presentation',
          style: 'dashed',
          to: 'auth/public',
        },
        {
          from: 'book/presentation',
          style: 'solid',
          to: 'book/domain',
        },
        {
          from: 'book/public',
          style: 'dotted',
          to: 'book/domain',
        },
      ],
      nodes: [
        {
          id: 'auth/public',
          layerName: 'public',
          moduleName: 'auth',
        },
        {
          id: 'auth/application',
          layerName: 'application',
          moduleName: 'auth',
        },
        {
          id: 'book/public',
          layerName: 'public',
          moduleName: 'book',
        },
        {
          id: 'book/domain',
          layerName: 'domain',
          moduleName: 'book',
        },
        {
          id: 'book/presentation',
          layerName: 'presentation',
          moduleName: 'book',
        },
        {
          id: 'kernel/domain',
          layerName: 'domain',
          moduleName: 'kernel',
        },
      ],
    });
  });

  it('formats Mermaid and DOT with graph style metadata', () => {
    const graph = buildModuleLayerGraph({
      modules: [
        {
          dependencies: [
            {
              dependencyTypes: ['local', 'dynamic-import'],
              resolved: 'src/modules/auth/client.ts',
            },
            {
              dependencyTypes: ['local', 'export'],
              resolved: 'src/modules/genre/index.ts',
            },
          ],
          source: 'src/modules/book/presentation/page-book.tsx',
        },
      ],
    });

    expect(formatMermaid(graph)).toContain(
      'node_book_presentation --> node_auth_public'
    );
    expect(formatMermaid(graph)).toContain('linkStyle 0 stroke-dasharray: 6 4');
    expect(formatMermaid(graph)).toContain('linkStyle 1 stroke-dasharray: 1 4');
    expect(formatDot(graph)).toContain(
      '"book/presentation" -> "auth/public" [style="dashed"]'
    );
    expect(formatDot(graph)).toContain(
      '"book/presentation" -> "genre/public" [style="dotted"]'
    );
  });

  it('documents dashed edges as dynamic imports or type-only dependencies', () => {
    expect(formatMarkdown('graph TD\n')).toContain(
      '- Dashed edges are dynamic imports or type-only dependencies.'
    );
    expect(formatMarkdown('graph TD\n')).not.toContain('type-only-only');
  });
});

describe('module dependency graph artifact checks', () => {
  it('creates only the DOT artifact for check mode', () => {
    const artifacts = createCheckedGraphArtifacts({
      modules: [
        {
          dependencies: [],
          source: 'src/modules/book/index.ts',
        },
      ],
    });

    expect(Object.keys(artifacts)).toEqual([ARTIFACT_FILENAMES.dot]);
    expect(artifacts[ARTIFACT_FILENAMES.dot]).toContain(
      'digraph ModuleLayerDependencies'
    );
  });

  it('normalizes line endings before comparing only the DOT artifact by default', () => {
    const actualDir = mkdtempSync(
      path.join(os.tmpdir(), 'module-graph-actual-')
    );
    const expectedDir = mkdtempSync(
      path.join(os.tmpdir(), 'module-graph-expected-')
    );

    try {
      writeFileSync(
        path.join(actualDir, ARTIFACT_FILENAMES.dot),
        'line 1\r\nline 2\r\n'
      );
      writeFileSync(
        path.join(expectedDir, ARTIFACT_FILENAMES.dot),
        'line 1\nline 2\n'
      );
      writeFileSync(
        path.join(actualDir, ARTIFACT_FILENAMES.markdown),
        'old markdown\n'
      );
      writeFileSync(
        path.join(expectedDir, ARTIFACT_FILENAMES.markdown),
        'changed markdown\n'
      );
      writeFileSync(path.join(actualDir, ARTIFACT_FILENAMES.svg), 'old svg\n');
      writeFileSync(
        path.join(expectedDir, ARTIFACT_FILENAMES.svg),
        'changed svg\n'
      );

      expect(compareArtifactDirectories({ actualDir, expectedDir })).toEqual(
        []
      );

      writeFileSync(
        path.join(expectedDir, ARTIFACT_FILENAMES.dot),
        'line 1\nchanged\n'
      );

      expect(compareArtifactDirectories({ actualDir, expectedDir })).toEqual([
        ARTIFACT_FILENAMES.dot,
      ]);
    } finally {
      rmSync(actualDir, { force: true, recursive: true });
      rmSync(expectedDir, { force: true, recursive: true });
    }
  });
});
