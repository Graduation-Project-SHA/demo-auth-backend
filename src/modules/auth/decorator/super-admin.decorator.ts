import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_KEY = 'super_admin';
export const RequireSuperAdmin = () => SetMetadata(SUPER_ADMIN_KEY, true);
