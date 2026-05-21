export function hasDefinedOverrides(overrides?: object) {
  return Object.values(overrides ?? {}).some((value) => value !== undefined);
}
