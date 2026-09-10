import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async create(organizationId: string, data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.db.user.create({
      data: {
        ...data,
        password: hashedPassword,
        organization: { connect: { id: organizationId } },
      },
    });
  }

  async findAll(organizationId: string) {
    return this.db.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        roles: {
          include: { role: true },
        },
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    const user = await this.db.user.findFirst({
      where: { id, organizationId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async updateStatus(organizationId: string, id: string, status: UserStatus) {
    await this.findOne(organizationId, id);
    return this.db.user.update({
      where: { id },
      data: { status },
    });
  }
}
