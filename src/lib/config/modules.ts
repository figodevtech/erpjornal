export const modulesConfig = {
  videos: {
    enabled: false,
    route: "/videos",
  },
  podcasts: {
    enabled: false,
    route: "/podcasts",
  },
};

export type ModuleName = keyof typeof modulesConfig;

export function isModuleEnabled(moduleName: ModuleName): boolean {
  return modulesConfig[moduleName]?.enabled ?? true;
}
