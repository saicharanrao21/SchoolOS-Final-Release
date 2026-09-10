import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

@Injectable()
export class RolesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(organizationId: string) {
    return this.db.role.findMany({
      where: {
        OR: [
          { organizationId: null }, // Global roles
          { organizationId }, // Tenant roles
        ],
      },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async findOne(id: string) {
    const role = await this.db.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async findAllPermissions() {
    return this.db.permission.findMany();
  }
}
