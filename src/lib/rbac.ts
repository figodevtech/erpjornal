export type RoleName = 'reporter' | 'editor' | 'juridico' | 'admin';

export const rbacRules = {
  reporter: {
    canPublish: false,
    canCreateDraft: true,
    canViewSecretSources: false,
    canManageUsers: false,
  },
  editor: {
    canPublish: true,
    canCreateDraft: true,
    canViewSecretSources: true,
    canManageUsers: false,
  },
  juridico: {
    canPublish: false,
    canCreateDraft: false,
    canViewSecretSources: false,
    canManageUsers: false,
  },
  admin: {
    canPublish: true,
    canCreateDraft: true,
    canViewSecretSources: true,
    canManageUsers: true,
  }
};

export function hasPermission(role: string, action: keyof typeof rbacRules.reporter): boolean {
  const normalizedRole = role.toLowerCase() as RoleName;
  if (!rbacRules[normalizedRole]) return false;
  return rbacRules[normalizedRole][action];
}
