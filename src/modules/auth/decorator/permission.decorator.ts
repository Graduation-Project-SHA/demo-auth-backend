import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

const PERMISSIONS = {
  READ: 1,
  WRITE: 2,
  DELETE: 4,
};

export interface PermissionRequirement {
  resource: string;
  level: number;
}

export const RequirePermission = (resource: string, level: number) =>
  SetMetadata(PERMISSIONS_KEY, { resource, level });

export const RequireRead = (resource: string) =>
  RequirePermission(resource, PERMISSIONS.READ);

export const RequireWrite = (resource: string) =>
  RequirePermission(resource, PERMISSIONS.WRITE);

export const RequireDelete = (resource: string) =>
  RequirePermission(resource, PERMISSIONS.DELETE);

export const RequireFullAccess = (resource: string) =>
  RequirePermission(
    resource,
    PERMISSIONS.READ | PERMISSIONS.WRITE | PERMISSIONS.DELETE,
  );
