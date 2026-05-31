import type { SheriffConfig } from '@softarc/sheriff-core';

type SheriffRuleContext = {
  from: string;
  to: string;
  fromModulePath: string;
  toModulePath: string;
  fromFilePath: string;
  toFilePath: string;
};

type RuleMatcher = (context: SheriffRuleContext) => boolean;

const publicModuleApi: RuleMatcher = ({ to }) => to === 'layer:public';

const kernelInternal: RuleMatcher = ({ toModulePath }) =>
  /\/src\/modules\/kernel\/(?:domain|application|transport|infrastructure)(?:\/|$)/.test(
    toModulePath
  );

const isModuleInternalTargetPath = (toModulePath: string) =>
  !/\/src\/(?:app|composition)(?:\/|$)/.test(toModulePath);

const isServerFunctionEntrypoint = (fromFilePath: string) =>
  /\/src\/modules\/[^/]+\/transport\/server-functions(?:\/|$)/.test(
    fromFilePath
  );

const transportTarget: RuleMatcher = ({ toModulePath }) =>
  isModuleInternalTargetPath(toModulePath) &&
  !/\/src\/modules\/(?!kernel\/)[^/]+\/(?:infrastructure|presentation)(?:\/|$)/.test(
    toModulePath
  );

const presentationTarget: RuleMatcher = ({ toModulePath }) =>
  isModuleInternalTargetPath(toModulePath) &&
  !/\/src\/modules\/(?!kernel\/)[^/]+\/infrastructure(?:\/|$)/.test(
    toModulePath
  );

const infrastructureTarget: RuleMatcher = ({ fromModulePath, toModulePath }) =>
  isModuleInternalTargetPath(toModulePath) &&
  !(
    /\/src\/modules\/(?:account|book|genre|user)\/infrastructure(?:\/|$)/.test(
      fromModulePath
    ) &&
    /\/src\/modules\/(?:account|book|genre|user)\/presentation(?:\/|$)/.test(
      toModulePath
    )
  );

const moduleName = (placeholders: Record<string, string>) => {
  const name = placeholders.module;

  if (name === undefined) {
    throw new Error('Sheriff module placeholder is required.');
  }

  return name;
};

const moduleTags = (module: string, layer: string) => [
  'area:module',
  `module:${module}`,
  `layer:${layer}`,
];

export const config: SheriffConfig = {
  version: 1,
  entryPoints: {
    app: 'src/router.tsx',
    server: 'src/server.ts',
    start: 'src/start.ts',
  },
  autoTagging: false,
  enableBarrelLess: true,
  barrelFileName: '__sheriff_public_api_disabled__.ts',
  encapsulationPattern: '__sheriff_internal__',
  modules: {
    'src/platform': ['area:platform', 'layer:platform'],
    'src/app': ['area:app', 'layer:app'],
    'src/app/i18n': ['area:locales', 'layer:platform-support'],
    'src/routes': ['area:routes', 'layer:routes'],
    'src/composition': ['area:composition', 'layer:composition'],
    'src/modules/<module>': (placeholders) =>
      moduleTags(moduleName(placeholders), 'public'),
    'src/modules/<module>/domain': (placeholders) =>
      moduleTags(moduleName(placeholders), 'domain'),
    'src/modules/<module>/application': (placeholders) =>
      moduleTags(moduleName(placeholders), 'application'),
    'src/modules/<module>/infrastructure': (placeholders) =>
      moduleTags(moduleName(placeholders), 'infrastructure'),
    'src/modules/<module>/transport': (placeholders) =>
      moduleTags(moduleName(placeholders), 'transport'),
    'src/modules/<module>/presentation': (placeholders) =>
      moduleTags(moduleName(placeholders), 'presentation'),
  },
  depRules: {
    root: () => true,
    'area:*': () => true,
    'module:*': () => true,
    'layer:public': () => true,
    'layer:routes': () => true,
    'layer:composition': () => true,
    'layer:platform': ['layer:platform', 'layer:platform-support'],
    'layer:platform-support': ['layer:platform', 'layer:platform-support'],
    'layer:app': [
      'layer:app',
      'layer:platform',
      'layer:platform-support',
      publicModuleApi,
    ],
    'layer:domain': [publicModuleApi, ({ to }) => to === 'layer:domain'],
    'layer:application': [
      publicModuleApi,
      kernelInternal,
      ({ to }) => to === 'layer:domain',
      ({ to }) => to === 'layer:application',
    ],
    'layer:infrastructure': [infrastructureTarget],
    'layer:transport': [
      publicModuleApi,
      kernelInternal,
      ({ fromFilePath, to }) =>
        isServerFunctionEntrypoint(fromFilePath) && to === 'layer:composition',
      transportTarget,
    ],
    'layer:presentation': [publicModuleApi, presentationTarget],
  },
};
