import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SearchService {
  constructor(private readonly db: DatabaseService) {}

  async globalSearch(organizationId: string, query: string, role: string, userId: string) {
    // In a real production system, this would be a full-text search or Elasticsearch
    // Here we implement a multi-entity aggregate search with authorization context

    const results = [];

    // 1. Search Students (Authorized by Organization)
    const students = await this.db.student.findMany({
      where: {
        school: { organizationId },
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { admissionNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });
    results.push(...students.map(s => ({
      id: s.id, type: 'STUDENT', title: `${s.firstName} ${s.lastName}`, subtitle: s.admissionNumber
    })));

    // 2. Search Employees
    const employees = await this.db.employee.findMany({
      where: {
        school: { organizationId },
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { employeeId: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });
    results.push(...employees.map(e => ({
      id: e.id, type: 'EMPLOYEE', title: `${e.firstName} ${e.lastName}`, subtitle: e.employeeId
    })));

    // 3. Search Inventory Items
    const items = await this.db.inventoryItem.findMany({
      where: {
        school: { organizationId },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });
    results.push(...items.map(i => ({
      id: i.id, type: 'INVENTORY', title: i.name, subtitle: i.code
    })));

    // 4. Search Assets
    const assets = await this.db.asset.findMany({
      where: {
        school: { organizationId },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { assetTag: { contains: query, mode: 'insensitive' } },
          { serialNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });
    results.push(...assets.map(a => ({
      id: a.id, type: 'ASSET', title: a.name, subtitle: a.assetTag
    })));

    return results;
  }
}
