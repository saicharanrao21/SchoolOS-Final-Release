import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:schoolos_mobile/theme/app_theme.dart';
import 'package:schoolos_mobile/networking/api_client.dart';
import 'package:schoolos_mobile/features/parent/data/repositories/parent_repository.dart';
import 'package:schoolos_mobile/features/parent/presentation/bloc/parent_bloc.dart';
import 'package:schoolos_mobile/features/parent/presentation/bloc/parent_event.dart';
import 'package:schoolos_mobile/features/parent/presentation/pages/parent_home_page.dart';
import 'package:schoolos_mobile/features/parent/presentation/pages/parent_attendance_page.dart';
import 'package:schoolos_mobile/features/parent/presentation/pages/parent_fees_page.dart';
import 'package:schoolos_mobile/features/parent/presentation/pages/parent_transport_page.dart';
import 'package:schoolos_mobile/features/parent/presentation/pages/parent_profile_page.dart';
import 'package:schoolos_mobile/features/parent/presentation/pages/parent_notifications_page.dart';
import 'package:schoolos_mobile/features/teacher/data/repositories/teacher_repository.dart';
import 'package:schoolos_mobile/features/teacher/presentation/bloc/teacher_bloc.dart';
import 'package:schoolos_mobile/features/teacher/presentation/bloc/teacher_event.dart';
import 'package:schoolos_mobile/features/teacher/presentation/pages/teacher_home_page.dart';
import 'package:schoolos_mobile/features/teacher/presentation/pages/teacher_classes_page.dart';
import 'package:schoolos_mobile/features/teacher/presentation/pages/teacher_timetable_page.dart';
import 'package:schoolos_mobile/features/transport_operator/data/repositories/transport_operator_repository.dart';
import 'package:schoolos_mobile/features/transport_operator/presentation/bloc/transport_operator_bloc.dart';
import 'package:schoolos_mobile/features/transport_operator/presentation/bloc/transport_operator_event.dart';
import 'package:schoolos_mobile/features/transport_operator/presentation/pages/operator_home_page.dart';
import 'package:schoolos_mobile/features/transport_operator/presentation/pages/operator_trip_page.dart';
import 'package:schoolos_mobile/features/transport_operator/presentation/pages/operator_manifest_page.dart';
import 'package:schoolos_mobile/features/transport_operator/presentation/pages/operator_safety_page.dart';
import 'package:schoolos_mobile/features/student/data/repositories/student_repository.dart';
import 'package:schoolos_mobile/features/student/presentation/bloc/student_bloc.dart';
import 'package:schoolos_mobile/features/student/presentation/bloc/student_event.dart';
import 'package:schoolos_mobile/features/student/presentation/pages/student_home_page.dart';
import 'package:schoolos_mobile/features/student/presentation/pages/student_academics_page.dart';
import 'package:schoolos_mobile/features/student/presentation/pages/student_tasks_page.dart';
import 'package:schoolos_mobile/features/student/presentation/pages/student_results_page.dart';
import 'package:schoolos_mobile/features/workflow/presentation/pages/approval_inbox_page.dart';
import 'package:schoolos_mobile/features/analytics/presentation/pages/analytics_dashboard_page.dart';
import 'package:schoolos_mobile/features/hr/presentation/pages/self_service_page.dart';
import 'package:schoolos_mobile/features/security/presentation/pages/pickup_request_page.dart';
import 'package:schoolos_mobile/features/shared/pages/campus_life_page.dart';

class RoleShell extends StatefulWidget {
  final List<NavigationDestination> destinations;
  final List<Widget> pages;
  final String title;

  const RoleShell({
    super.key,
    required this.destinations,
    required this.pages,
    required this.title,
  });

  @override
  State<RoleShell> createState() => _RoleShellState();
}

class _RoleShellState extends State<RoleShell> {
  int _index = 0;
  String _activeSchool = 'SchoolOS Main Campus';
  String _activeSession = '2026-2027';

  void _showContextDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Active Workspace Context', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.school, color: AppTheme.primaryColor),
                title: const Text('Main Campus'),
                subtitle: const Text('Active School'),
                trailing: const Icon(Icons.check_circle, color: AppTheme.primaryColor),
                onTap: () {
                  setState(() => _activeSchool = 'SchoolOS Main Campus');
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.school_outlined, color: AppTheme.navyColor),
                title: const Text('North Branch'),
                subtitle: const Text('Secondary Campus'),
                onTap: () {
                  setState(() => _activeSchool = 'SchoolOS North Branch');
                  Navigator.pop(context);
                },
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.calendar_month, color: AppTheme.navyColor),
                title: Text('Session: $_activeSession'),
                subtitle: const Text('Academic Year'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: GestureDetector(
          onTap: _showContextDialog,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.navyColor),
              ),
              Row(
                children: [
                  Text(
                    '$_activeSchool • $_activeSession',
                    style: const TextStyle(fontSize: 10, color: Colors.black54, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(width: 2),
                  const Icon(Icons.arrow_drop_down, size: 14, color: Colors.black54),
                ],
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, size: 20),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Search Command Center Launched')),
              );
            },
          ),
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.notifications_outlined, size: 22),
                Positioned(
                  right: 0,
                  top: 0,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    constraints: const BoxConstraints(minWidth: 8, minHeight: 8),
                  ),
                ),
              ],
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Notification Center Drawer')),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: IndexedStack(
        index: _index,
        children: widget.pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (idx) => setState(() => _index = idx),
        destinations: widget.destinations,
      ),
    );
  }
}

class ParentShell extends StatelessWidget {
  final ApiClient apiClient;

  const ParentShell({super.key, required this.apiClient});

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider(
      create: (_) => ParentRepository(apiClient: apiClient),
      child: BlocProvider(
        create: (context) => ParentBloc(repository: context.read<ParentRepository>())..add(LoadDashboard()),
        child: RoleShell(
          title: 'Parent Portal',
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.calendar_month_outlined), selectedIcon: Icon(Icons.calendar_month), label: 'Attendance'),
            NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), selectedIcon: Icon(Icons.account_balance_wallet), label: 'Fees'),
            NavigationDestination(icon: Icon(Icons.directions_bus_outlined), selectedIcon: Icon(Icons.directions_bus), label: 'Transport'),
            NavigationDestination(icon: Icon(Icons.notifications_none_outlined), selectedIcon: Icon(Icons.notifications), label: 'Notices'),
            NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
          ],
          pages: const [
            ParentHomePage(),
            ParentAttendancePage(),
            ParentFeesPage(),
            ParentTransportPage(),
            ParentNotificationsPage(),
            ParentProfilePage(),
          ],
        ),
      ),
    );
  }
}

class StudentShell extends StatelessWidget {
  final ApiClient apiClient;

  const StudentShell({super.key, required this.apiClient});

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider(
      create: (_) => StudentRepository(apiClient: apiClient),
      child: BlocProvider(
        create: (context) => StudentBloc(repository: context.read<StudentRepository>())..add(LoadStudentDashboard()),
        child: RoleShell(
          title: 'Student Portal',
          destinations: const [
            NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
            NavigationDestination(icon: Icon(Icons.school_outlined), selectedIcon: Icon(Icons.school), label: 'Academics'),
            NavigationDestination(icon: Icon(Icons.task_alt_outlined), selectedIcon: Icon(Icons.task_alt), label: 'Tasks'),
            NavigationDestination(icon: Icon(Icons.grade_outlined), selectedIcon: Icon(Icons.grade), label: 'Results'),
            NavigationDestination(icon: Icon(Icons.style_outlined), selectedIcon: Icon(Icons.style), label: 'Campus'),
          ],
          pages: const [
            StudentHomePage(),
            StudentAcademicsPage(),
            StudentTasksPage(),
            StudentResultsPage(),
            CampusLifePage(),
          ],
        ),
      ),
    );
  }
}

class TeacherShell extends StatelessWidget {
  final ApiClient apiClient;

  const TeacherShell({super.key, required this.apiClient});

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider(
      create: (_) => TeacherRepository(apiClient: apiClient),
      child: BlocProvider(
        create: (context) => TeacherBloc(repository: context.read<TeacherRepository>())..add(LoadTeacherDashboard()),
        child: RoleShell(
          title: 'Teacher Workspace',
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_work_outlined), selectedIcon: Icon(Icons.home_work), label: 'Workspace'),
            NavigationDestination(icon: Icon(Icons.class_outlined), selectedIcon: Icon(Icons.class_), label: 'Classes'),
            NavigationDestination(icon: Icon(Icons.schedule_outlined), selectedIcon: Icon(Icons.schedule), label: 'Timetable'),
            NavigationDestination(icon: Icon(Icons.approval_outlined), selectedIcon: Icon(Icons.approval), label: 'Approvals'),
            NavigationDestination(icon: Icon(Icons.badge_outlined), selectedIcon: Icon(Icons.badge), label: 'Self-Service'),
          ],
          pages: const [
            TeacherHomePage(),
            TeacherClassesPage(),
            TeacherTimetablePage(),
            ApprovalInboxPage(),
            SelfServicePage(),
          ],
        ),
      ),
    );
  }
}

class TransportOperatorShell extends StatelessWidget {
  final ApiClient apiClient;

  const TransportOperatorShell({super.key, required this.apiClient});

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider(
      create: (_) => TransportOperatorRepository(apiClient: apiClient),
      child: BlocProvider(
        create: (context) => TransportOperatorBloc(repository: context.read<TransportOperatorRepository>())..add(LoadOperatorDashboard()),
        child: RoleShell(
          title: 'Transport Operations',
          destinations: const [
            NavigationDestination(icon: Icon(Icons.local_shipping_outlined), selectedIcon: Icon(Icons.local_shipping), label: 'Trip'),
            NavigationDestination(icon: Icon(Icons.map_outlined), selectedIcon: Icon(Icons.map), label: 'Route'),
            NavigationDestination(icon: Icon(Icons.checklist_outlined), selectedIcon: Icon(Icons.checklist), label: 'Manifest'),
            NavigationDestination(icon: Icon(Icons.security_outlined), selectedIcon: Icon(Icons.security), label: 'Safety'),
          ],
          pages: const [
            OperatorHomePage(),
            OperatorTripPage(),
            OperatorManifestPage(tripId: 'trip-1', routeName: 'Route 1'),
            OperatorSafetyPage(),
          ],
        ),
      ),
    );
  }
}

class SecurityShell extends StatelessWidget {
  final ApiClient apiClient;

  const SecurityShell({super.key, required this.apiClient});

  @override
  Widget build(BuildContext context) {
    return RoleShell(
      title: 'Gate Security',
      destinations: const [
        NavigationDestination(icon: Icon(Icons.shield_outlined), selectedIcon: Icon(Icons.shield), label: 'Security'),
        NavigationDestination(icon: Icon(Icons.no_accounts_outlined), selectedIcon: Icon(Icons.no_accounts), label: 'Pickups'),
        NavigationDestination(icon: Icon(Icons.inbox_outlined), selectedIcon: Icon(Icons.inbox), label: 'Approvals'),
      ],
      pages: const [
        PickupRequestPage(),
        PickupRequestPage(),
        ApprovalInboxPage(),
      ],
    );
  }
}

class AdminShell extends StatelessWidget {
  final ApiClient apiClient;

  const AdminShell({super.key, required this.apiClient});

  @override
  Widget build(BuildContext context) {
    return RoleShell(
      title: 'Executive Console',
      destinations: const [
        NavigationDestination(icon: Icon(Icons.insights_outlined), selectedIcon: Icon(Icons.insights), label: 'Analytics'),
        NavigationDestination(icon: Icon(Icons.all_inbox_outlined), selectedIcon: Icon(Icons.all_inbox), label: 'Approvals'),
        NavigationDestination(icon: Icon(Icons.style_outlined), selectedIcon: Icon(Icons.style), label: 'Campus'),
      ],
      pages: const [
        AnalyticsDashboardPage(),
        ApprovalInboxPage(),
        CampusLifePage(),
      ],
    );
  }
}
