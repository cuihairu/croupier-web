/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const acc = (initialState?.currentUser as any)?.access as string | undefined;
  const perms = new Set((acc || '').split(',').filter(Boolean));
  const has = (p: string) => perms.has('*') || perms.has(p);
  return {
    canAdmin: has('admin'),
    canRegistryRead: has('registry:read'),
    canAssignmentsRead: has('assignments:read'),
    canAssignmentsWrite: has('assignments:write'),
    canPacksReload: has('packs:reload'),
    canPacksExport: has('packs:export'),
    canAuditRead: has('audit:read'),
  };
}
