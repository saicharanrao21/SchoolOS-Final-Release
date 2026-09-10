import { PrismaClient, UserStatus, AcademicYearStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Create System Organization
  const systemOrg = await prisma.organization.upsert({
    where: { slug: 'system' },
    update: {},
    create: {
      name: 'SchoolOS System',
      slug: 'system',
      displayName: 'SchoolOS Platform',
    },
  });

  // 2. Create Core Permissions
  const permissions = [
    'organization.read', 'organization.create', 'organization.update', 'organization.archive',
    'school.read', 'school.create', 'school.update', 'school.archive',
    'campus.read', 'campus.create', 'campus.update', 'campus.archive',
    'user.read', 'user.create', 'user.update', 'user.disable',
    'role.read', 'role.manage',
    'audit.read',
    'academic_year.read', 'academic_year.create', 'academic_year.update',
    'class.read', 'class.create', 'class.update',
    'department.read', 'department.create', 'location.read', 'location.create',
    'attendance.read', 'attendance.mark', 'attendance.lock', 'attendance.correct', 'attendance.approve', 'attendance.policy.manage',
    'leave.read', 'leave.request', 'leave.approve', 'leave.manage', 'leave.policy.manage',
    'transport.read', 'transport.manage', 'vehicle.read', 'vehicle.manage', 'route.read', 'route.manage', 'route.publish',
    'trip.read', 'trip.manage', 'trip.start', 'trip.complete', 'transport.assignment.read', 'transport.assignment.manage',
    'transport.board', 'transport.deboard', 'transport.gps.read', 'transport.gps.publish', 'transport.safety.read',
    'transport.safety.manage', 'transport.emergency.create', 'transport.emergency.manage', 'pickup.read', 'pickup.manage', 'pickup.verify',
    'teacher.dashboard.read', 'teacher.profile.read', 'teacher.profile.manage', 'teacher.class.read', 'teacher.student.read',
    'teacher.homework.create', 'teacher.homework.manage', 'teacher.homework.review', 'teacher.curriculum.read', 'teacher.exam.attendance',
    'teacher.marks.enter', 'teacher.marks.submit', 'teacher.leave.read', 'teacher.leave.create',
    'student.dashboard.read', 'student.profile.read', 'student.timetable.read', 'student.homework.read', 'student.homework.submit',
    'student.attendance.read', 'student.exam.read', 'student.result.read', 'student.reportcard.read', 'student.transport.read',
    'library.read', 'library.books.create', 'library.books.update', 'library.copies.manage', 'library.issue', 'library.return', 'library.renew', 'library.reservation.manage', 'library.fines.manage',
    'hostel.read', 'hostel.manage', 'hostel.rooms.manage', 'hostel.beds.manage', 'hostel.allocate', 'hostel.transfer', 'hostel.attendance', 'hostel.outpass.manage', 'hostel.incidents.manage',
    'events.read', 'events.create', 'events.update', 'events.publish', 'events.registration.manage', 'events.attendance', 'events.results.manage',
    'ptm.read', 'ptm.manage', 'ptm.slots.manage', 'ptm.book', 'ptm.notes.create', 'ptm.notes.read', 'ptm.complete',
    'inventory.read', 'inventory.manage', 'inventory.receive', 'inventory.issue', 'inventory.transfer', 'inventory.adjust',
    'procurement.read', 'procurement.create', 'procurement.approve', 'procurement.po.create', 'procurement.po.approve',
    'asset.read', 'asset.create', 'asset.assign', 'asset.maintenance', 'asset.dispose', 'vendor.read', 'vendor.manage',
    'security.read', 'security.manage', 'security.visitors.manage', 'security.visitors.checkin', 'security.visitors.checkout',
    'pickup.read', 'pickup.request', 'pickup.approve', 'pickup.verify', 'pickup.release',
    'incident.read', 'incident.report', 'incident.assign', 'incident.resolve', 'incident.close', 'incident.critical',
    'analytics.executive.read', 'analytics.students.read', 'analytics.finance.read', 'analytics.attendance.read', 'analytics.academics.read',
    'platform.support.impersonate',
    'platform.audit.read',
    'notifications.gateway.read', 'notifications.gateway.manage',
    'health.read', 'health.manage',
    'student_life.read', 'student_life.manage',
    'lms.read', 'lms.manage',
    'communications.messages.read', 'communications.messages.manage', 'fees.manage', 'accounting.bank_reconciliation.read', 'accounting.bank_reconciliation.manage', 'hr.compliance.read', 'hr.compliance.manage', 'hr.performance.read', 'hr.performance.manage', 'hr.training.read', 'hr.training.manage'
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p },
    });
  }

  // 3. Create SUPER_ADMIN role
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'System-wide administrator',
    },
  });

  // 4. Create Initial Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@schoolos.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@schoolos.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      organizationId: systemOrg.id,
      status: UserStatus.ACTIVE,
    },
  });

  // 5. Assign Role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  // 6. Create a Demo School
  const demoSchool = await prisma.school.upsert({
    where: { id: 'demo-school-id' }, // Just for deterministic seeding
    update: {},
    create: {
      id: 'demo-school-id',
      name: 'Global Academy',
      displayName: 'Global Academy High',
      code: 'GA-01',
      organizationId: systemOrg.id,
    },
  });

  // 7. Create Academic Year
  let ay = await prisma.academicYear.findFirst({
    where: { schoolId: demoSchool.id, name: '2026-27' },
  });

  if (!ay) {
    ay = await prisma.academicYear.create({
      data: {
        name: '2026-27',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-05-31'),
        status: AcademicYearStatus.ACTIVE,
        isCurrent: true,
        schoolId: demoSchool.id,
      },
    });
  }

  // 8. Create Classes
  for (let i = 1; i <= 10; i++) {
    const cls = await prisma.class.upsert({
      where: { schoolId_name_academicYearId: { schoolId: demoSchool.id, name: `Grade ${i}`, academicYearId: ay.id } },
      update: {},
      create: {
        name: `Grade ${i}`,
        sequence: i,
        schoolId: demoSchool.id,
        academicYearId: ay.id,
      },
    });

    // Create Sections
    for (const secName of ['A', 'B']) {
      await prisma.section.upsert({
        where: { classId_name: { classId: cls.id, name: secName } },
        update: {},
        create: {
          name: secName,
          classId: cls.id,
          capacity: 30,
        },
      });
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
