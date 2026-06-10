import { cruise } from 'dependency-cruiser';
import extractDepcruiseOptions from 'dependency-cruiser/config-utl/extract-depcruise-options';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveTrustedTool } from './trusted-tool';

const MODULES_ROOT = 'src/modules';
const DEFAULT_OUTPUT_DIR = 'docs/architecture';
const DEPCRUISE_CONFIG_FILE = '.dependency-cruiser.cjs';
const MAX_GRAPHVIZ_OUTPUT_BYTES = 25 * 1024 * 1024;

const MODULE_LAYERS = [
  'application',
  'domain',
  'infrastructure',
  'presentation',
  'transport',
] as const;
const MODULE_LAYER_SET = new Set<string>(MODULE_LAYERS);
const LAYER_ORDER = ['public', ...MODULE_LAYERS] as const;

export const ARTIFACT_FILENAMES = {
  dot: 'module-layer-dependencies.dot',
  markdown: 'module-layer-dependencies.md',
  svg: 'module-layer-dependencies.svg',
} as const;

export const USAGE = `Usage: pnpm exec tsx scripts/generate-module-dependency-graph.ts [options]

Options:
  --check              Fail when committed graph artifacts are stale
  --output-dir <path>  Directory for generated artifacts (default: docs/architecture)
  --help              Show this help message`;

type DependencyCruiserDependency = {
  dependencyTypes?: string[];
  dynamic?: boolean;
  resolved?: string;
};

type DependencyCruiserModule = {
  dependencies?: DependencyCruiserDependency[];
  source: string;
};

export type DependencyCruiserReport = {
  modules: DependencyCruiserModule[];
};

export type ModuleLayerName = (typeof LAYER_ORDER)[number];

export type ModuleLayerNode = {
  id: string;
  layerName: ModuleLayerName;
  moduleName: string;
};

export type EdgeStyle = 'dashed' | 'dotted' | 'solid';

export type ModuleLayerEdge = {
  from: string;
  style: EdgeStyle;
  to: string;
};

export type ModuleLayerGraph = {
  edges: ModuleLayerEdge[];
  nodes: ModuleLayerNode[];
};

export type GraphArtifacts = Record<
  (typeof ARTIFACT_FILENAMES)[keyof typeof ARTIFACT_FILENAMES],
  string
>;

export type CliOptions = {
  check: boolean;
  help: boolean;
  outputDir: string;
};

export type ParseCliArgumentsResult =
  | { ok: true; options: CliOptions }
  | { error: string; ok: false };

const normalizePath = (filePath: string) =>
  path.posix
    .normalize(filePath.replaceAll('\\', '/').trim())
    .replace(/^\.\//, '');

const compareText = (left: string, right: string) =>
  left.localeCompare(right, 'en');

const normalizeLineEndings = (value: string) => value.replace(/\r\n/g, '\n');

const layerOrderIndex = (layerName: ModuleLayerName) => {
  const index = LAYER_ORDER.indexOf(layerName);
  return index === -1 ? LAYER_ORDER.length : index;
};

export const groupModulePath = (
  filePath: string
): ModuleLayerNode | undefined => {
  const normalizedPath = normalizePath(filePath);
  const pathParts = normalizedPath.split('/');

  if (
    pathParts.length < 4 ||
    pathParts[0] !== 'src' ||
    pathParts[1] !== 'modules'
  ) {
    return undefined;
  }

  const moduleName = pathParts[2];
  if (!moduleName) return undefined;

  const firstModuleSegment = pathParts[3];
  if (!firstModuleSegment) return undefined;

  const layerName = MODULE_LAYER_SET.has(firstModuleSegment)
    ? (firstModuleSegment as ModuleLayerName)
    : 'public';

  return {
    id: `${moduleName}/${layerName}`,
    layerName,
    moduleName,
  };
};

const classifyDependencyStyle = ({
  dependencyTypes = [],
  dynamic = false,
}: DependencyCruiserDependency): EdgeStyle => {
  const dependencyTypeSet = new Set(dependencyTypes);
  const isTypeOnly =
    dependencyTypeSet.has('type-only') || dependencyTypeSet.has('type-import');
  const isDynamic = dynamic || dependencyTypeSet.has('dynamic-import');
  const isReExport = dependencyTypeSet.has('export');
  const isStaticRuntime =
    !isTypeOnly &&
    (dependencyTypeSet.has('import') ||
      dependencyTypeSet.has('require') ||
      dependencyTypeSet.has('import-equals'));

  if (isStaticRuntime) return 'solid';
  if (isTypeOnly || isDynamic) return 'dashed';
  if (isReExport) return 'dotted';

  return 'solid';
};

export const getDependencyStyle = classifyDependencyStyle;

const mergeEdgeStyle = (left: EdgeStyle, right: EdgeStyle): EdgeStyle => {
  if (left === 'solid' || right === 'solid') return 'solid';
  if (left === 'dashed' || right === 'dashed') return 'dashed';
  return 'dotted';
};

const sortNodes = (nodes: ModuleLayerNode[]) =>
  [...nodes].sort((left, right) => {
    const moduleComparison = compareText(left.moduleName, right.moduleName);
    if (moduleComparison !== 0) return moduleComparison;

    return layerOrderIndex(left.layerName) - layerOrderIndex(right.layerName);
  });

const sortEdges = (edges: ModuleLayerEdge[]) =>
  [...edges].sort((left, right) => {
    const fromComparison = compareText(left.from, right.from);
    if (fromComparison !== 0) return fromComparison;

    const toComparison = compareText(left.to, right.to);
    if (toComparison !== 0) return toComparison;

    return compareText(left.style, right.style);
  });

export const buildModuleLayerGraph = (
  report: DependencyCruiserReport
): ModuleLayerGraph => {
  const nodesById = new Map<string, ModuleLayerNode>();
  const edgesByKey = new Map<string, ModuleLayerEdge>();

  const addNode = (node: ModuleLayerNode) => {
    nodesById.set(node.id, node);
  };

  for (const moduleInfo of report.modules) {
    const sourceNode = groupModulePath(moduleInfo.source);
    if (!sourceNode) continue;

    addNode(sourceNode);

    for (const dependency of moduleInfo.dependencies ?? []) {
      if (!dependency.resolved) continue;

      const targetNode = groupModulePath(dependency.resolved);
      if (!targetNode || sourceNode.id === targetNode.id) continue;

      addNode(targetNode);

      const edgeKey = `${sourceNode.id}->${targetNode.id}`;
      const nextStyle = classifyDependencyStyle(dependency);
      const existingEdge = edgesByKey.get(edgeKey);

      edgesByKey.set(edgeKey, {
        from: sourceNode.id,
        style: existingEdge
          ? mergeEdgeStyle(existingEdge.style, nextStyle)
          : nextStyle,
        to: targetNode.id,
      });
    }
  }

  return {
    edges: sortEdges([...edgesByKey.values()]),
    nodes: sortNodes([...nodesById.values()]),
  };
};

const escapeMermaidLabel = (label: string) => label.replaceAll('"', '#quot;');

const mermaidNodeId = (id: string) =>
  `node_${id.replaceAll(/[^a-zA-Z0-9_]/g, '_')}`;

const mermaidModuleId = (moduleName: string) =>
  `module_${moduleName.replaceAll(/[^a-zA-Z0-9_]/g, '_')}`;

const groupNodesByModule = (nodes: ModuleLayerNode[]) => {
  const groupedNodes = new Map<string, ModuleLayerNode[]>();

  for (const node of nodes) {
    groupedNodes.set(node.moduleName, [
      ...(groupedNodes.get(node.moduleName) ?? []),
      node,
    ]);
  }

  return [...groupedNodes.entries()].sort(([left], [right]) =>
    compareText(left, right)
  );
};

export const formatMermaid = (graph: ModuleLayerGraph) => {
  const lines = ['flowchart LR', ''];

  for (const [moduleName, nodes] of groupNodesByModule(graph.nodes)) {
    lines.push(
      `subgraph ${mermaidModuleId(moduleName)}["${escapeMermaidLabel(
        moduleName
      )}"]`
    );

    for (const node of sortNodes(nodes)) {
      lines.push(
        `  ${mermaidNodeId(node.id)}["${escapeMermaidLabel(node.layerName)}"]`
      );
    }

    lines.push('end', '');
  }

  const styledEdgeIndexes: string[] = [];

  for (const [index, edge] of graph.edges.entries()) {
    lines.push(`${mermaidNodeId(edge.from)} --> ${mermaidNodeId(edge.to)}`);

    if (edge.style === 'dashed') {
      styledEdgeIndexes.push(`linkStyle ${index} stroke-dasharray: 6 4`);
    }

    if (edge.style === 'dotted') {
      styledEdgeIndexes.push(`linkStyle ${index} stroke-dasharray: 1 4`);
    }
  }

  if (styledEdgeIndexes.length > 0) {
    lines.push('', ...styledEdgeIndexes);
  }

  return `${lines.join('\n')}\n`;
};

const escapeDotValue = (value: string) =>
  value.replaceAll('\\', String.raw`\\`).replaceAll('"', String.raw`\"`);

const dotId = (id: string) => `"${escapeDotValue(id)}"`;

const dotClusterId = (moduleName: string) =>
  `cluster_${moduleName.replaceAll(/[^a-zA-Z0-9_]/g, '_')}`;

const dotFillColorForLayer = (layerName: ModuleLayerName) => {
  switch (layerName) {
    case 'application':
      return '#dbeafe';
    case 'domain':
      return '#dcfce7';
    case 'infrastructure':
      return '#ffedd5';
    case 'presentation':
      return '#fef9c3';
    case 'transport':
      return '#ede9fe';
    case 'public':
      return '#f3f4f6';
  }
};

export const formatDot = (graph: ModuleLayerGraph) => {
  const lines = [
    'digraph ModuleLayerDependencies {',
    '  graph [rankdir="LR", compound="true", fontname="Helvetica", fontsize="10", nodesep="0.35", ranksep="0.55"];',
    '  node [shape="box", style="rounded,filled", fontname="Helvetica", fontsize="10", color="#374151", fontcolor="#111827"];',
    '  edge [arrowsize="0.7", color="#4b5563", fontname="Helvetica", fontsize="9"];',
    '',
  ];

  for (const [moduleName, nodes] of groupNodesByModule(graph.nodes)) {
    lines.push(`  subgraph ${dotClusterId(moduleName)} {`);
    lines.push(`    label="${escapeDotValue(moduleName)}";`);
    lines.push('    color="#d1d5db";');
    lines.push('    style="rounded";');

    for (const node of sortNodes(nodes)) {
      lines.push(
        `    ${dotId(node.id)} [label="${escapeDotValue(
          node.layerName
        )}", fillcolor="${dotFillColorForLayer(node.layerName)}"];`
      );
    }

    lines.push('  }', '');
  }

  for (const edge of graph.edges) {
    lines.push(
      `  ${dotId(edge.from)} -> ${dotId(edge.to)} [style="${edge.style}"];`
    );
  }

  lines.push('}');

  return `${lines.join('\n')}\n`;
};

export const formatMarkdown = (mermaid: string) => `# Module Layer Dependencies

This diagram is generated from dependency-cruiser. Update it with \`pnpm architecture:graph\`; verify it with \`pnpm architecture:graph:check\`.

\`\`\`mermaid
${mermaid.trimEnd()}
\`\`\`

## Edge Styles

- Solid edges are static runtime imports.
- Dashed edges are dynamic imports or type-only dependencies.
- Dotted edges are re-export-only dependencies.
`;

export const createGraphArtifacts = (
  report: DependencyCruiserReport
): GraphArtifacts => {
  const graph = buildModuleLayerGraph(report);
  const dot = formatDot(graph);
  const mermaid = formatMermaid(graph);

  return {
    [ARTIFACT_FILENAMES.dot]: dot,
    [ARTIFACT_FILENAMES.markdown]: formatMarkdown(mermaid),
    [ARTIFACT_FILENAMES.svg]: renderSvgFromDot(dot),
  };
};

export const renderSvgFromDot = (dot: string) => {
  const result = spawnSync(resolveTrustedTool('dot'), ['-Tsvg'], {
    encoding: 'utf8',
    input: dot,
    maxBuffer: MAX_GRAPHVIZ_OUTPUT_BYTES,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (result.error) {
    throw new Error(
      `Graphviz dot failed to start: ${result.error.message}. Install Graphviz to generate module dependency SVG artifacts.`
    );
  }

  if (result.status !== 0) {
    throw new Error(
      `Graphviz dot failed with exit code ${result.status ?? 'unknown'}: ${result.stderr.trim()}`
    );
  }

  return result.stdout;
};

export const writeGraphArtifacts = (
  outputDir: string,
  artifacts: GraphArtifacts
) => {
  mkdirSync(outputDir, { recursive: true });

  for (const [fileName, content] of Object.entries(artifacts)) {
    writeFileSync(path.join(outputDir, fileName), content, 'utf8');
  }
};

export const compareArtifactDirectories = ({
  actualDir,
  expectedDir,
}: {
  actualDir: string;
  expectedDir: string;
}) => {
  const staleFiles: string[] = [];

  for (const fileName of Object.values(ARTIFACT_FILENAMES)) {
    const actualPath = path.join(actualDir, fileName);
    const expectedPath = path.join(expectedDir, fileName);

    if (!existsSync(expectedPath)) {
      staleFiles.push(fileName);
      continue;
    }

    const actualContent = normalizeLineEndings(
      readFileSync(actualPath, 'utf8')
    );
    const expectedContent = normalizeLineEndings(
      readFileSync(expectedPath, 'utf8')
    );

    if (actualContent !== expectedContent) {
      staleFiles.push(fileName);
    }
  }

  return staleFiles;
};

export const loadDependencyCruiserReport = async (
  cwd = process.cwd()
): Promise<DependencyCruiserReport> => {
  const options = await extractDepcruiseOptions(
    path.resolve(cwd, DEPCRUISE_CONFIG_FILE)
  );
  const result = await cruise([MODULES_ROOT], options);

  if (
    !result.output ||
    typeof result.output === 'string' ||
    !Array.isArray(result.output.modules)
  ) {
    throw new Error('dependency-cruiser did not return a module report.');
  }

  return result.output as DependencyCruiserReport;
};

const parseOutputDirOption = (args: string[], index: number) => {
  const value = args[index + 1];
  if (!value || value === '--' || value.startsWith('--')) {
    return { error: 'Missing value for --output-dir.', ok: false as const };
  }

  return { ok: true as const, value };
};

export const parseCliArguments = (args: string[]): ParseCliArgumentsResult => {
  const options: CliOptions = {
    check: false,
    help: false,
    outputDir: DEFAULT_OUTPUT_DIR,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg || arg === '--') continue;

    if (arg === '--check') {
      options.check = true;
      continue;
    }

    if (arg === '--help') {
      options.help = true;
      continue;
    }

    if (arg === '--output-dir') {
      const parsed = parseOutputDirOption(args, index);
      if (!parsed.ok) return { error: parsed.error, ok: false };

      options.outputDir = parsed.value;
      index += 1;
      continue;
    }

    return { error: `Unknown option: ${arg}`, ok: false };
  }

  return { ok: true, options };
};

const resolveOutputDir = (cwd: string, outputDir: string) =>
  path.isAbsolute(outputDir) ? outputDir : path.resolve(cwd, outputDir);

export const main = async (
  args = process.argv.slice(2),
  {
    cwd = process.cwd(),
    stderr = (message) => process.stderr.write(message),
    stdout = (message) => process.stdout.write(message),
  }: {
    cwd?: string;
    stderr?: (message: string) => void;
    stdout?: (message: string) => void;
  } = {}
) => {
  const parsed = parseCliArguments(args);
  if (!parsed.ok) {
    stderr(`${parsed.error}\n`);
    stderr(`${USAGE}\n`);
    return 2;
  }

  if (parsed.options.help) {
    stdout(`${USAGE}\n`);
    return 0;
  }

  try {
    const report = await loadDependencyCruiserReport(cwd);
    const artifacts = createGraphArtifacts(report);
    const outputDir = resolveOutputDir(cwd, parsed.options.outputDir);

    if (!parsed.options.check) {
      writeGraphArtifacts(outputDir, artifacts);
      stdout(`Generated module dependency graph artifacts in ${outputDir}\n`);
      return 0;
    }

    const tempDir = mkdtempSync(
      path.join(os.tmpdir(), 'module-dependency-graph-')
    );

    try {
      writeGraphArtifacts(tempDir, artifacts);
      const staleFiles = compareArtifactDirectories({
        actualDir: tempDir,
        expectedDir: outputDir,
      });

      if (staleFiles.length === 0) {
        stdout('Module dependency graph artifacts are up to date.\n');
        return 0;
      }

      stderr(
        [
          'Module dependency graph artifacts are stale:',
          ...staleFiles.map(
            (fileName) => `- ${path.join(outputDir, fileName)}`
          ),
          'Run `pnpm architecture:graph` and commit the updated artifacts.',
          '',
        ].join('\n')
      );
      return 1;
    } finally {
      rmSync(tempDir, { force: true, recursive: true });
    }
  } catch (error) {
    stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }
};

const entryPointPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : undefined;
const modulePath = fileURLToPath(import.meta.url);

const isCliEntrypoint = (
  entryPointPath: string | undefined,
  modulePath: string,
  platform: typeof process.platform = process.platform
) => {
  if (!entryPointPath) return false;

  return platform === 'win32'
    ? entryPointPath.toLowerCase() === modulePath.toLowerCase()
    : entryPointPath === modulePath;
};

if (isCliEntrypoint(entryPointPath, modulePath)) {
  process.exitCode = await main();
}
