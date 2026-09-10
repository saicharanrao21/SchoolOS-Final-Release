export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TenantScoped<T> = T & {
  organizationId: string;
};
