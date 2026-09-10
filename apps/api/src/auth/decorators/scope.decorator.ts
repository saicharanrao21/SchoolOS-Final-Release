import { SetMetadata } from '@nestjs/common';

export const SCOPE_KEY = 'scope_key';
export const RequireScope = (scope: 'ORGANIZATION' | 'SCHOOL' | 'CAMPUS') => SetMetadata(SCOPE_KEY, scope);
