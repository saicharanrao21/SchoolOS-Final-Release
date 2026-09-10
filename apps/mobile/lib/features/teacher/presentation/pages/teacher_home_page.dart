import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/teacher_bloc.dart';
import '../bloc/teacher_event.dart';
import '../bloc/teacher_state.dart';
import '../../../../theme/app_theme.dart';

class TeacherHomePage extends StatelessWidget {
  const TeacherHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TeacherBloc, TeacherState>(
      builder: (context, state) {
        if (state.isLoading && state.dashboard == null) {
          return const Center(child: CircularProgressIndicator());
        }

        final dashboard = state.dashboard;
        if (dashboard == null) {
          return const Center(child: Text('Failed to load dashboard'));
        }

        return RefreshIndicator(
          onRefresh: () async {
            context.read<TeacherBloc>().add(LoadTeacherDashboard());
          },
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              _buildWelcomeHeader(dashboard.profile),
              const SizedBox(height: 24),
              _buildQuickStats(dashboard),
              const SizedBox(height: 32),
              const Text('Upcoming Schedule', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
              const SizedBox(height: 16),
              ...dashboard.timetableToday.map((entry) => _buildScheduleItem(entry)).toList(),
              if (dashboard.timetableToday.isEmpty)
                const Center(child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: Text('No classes scheduled for today', style: TextStyle(color: Colors.black38)),
                )),
            ],
          ),
        );
      },
    );
  }

  Widget _buildWelcomeHeader(Map<String, dynamic> profile) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Welcome back,', style: TextStyle(color: Colors.black54)),
        Text(
          '${profile['firstName']} ${profile['lastName']}',
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.navyColor),
        ),
        Text(
          '${profile['designation']} • ${profile['department']}',
          style: TextStyle(fontSize: 13, color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildQuickStats(dynamic dashboard) {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            label: 'Homework',
            value: dashboard.pendingReviewsCount.toString(),
            sub: 'Pending Review',
            icon: Icons.assignment_turned_in_outlined,
            color: Colors.blue,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _StatCard(
            label: 'Exams',
            value: dashboard.upcomingExams.length.toString(),
            sub: 'Upcoming Tasks',
            icon: Icons.border_color_outlined,
            color: Colors.orange,
          ),
        ),
      ],
    );
  }

  Widget _buildScheduleItem(Map<String, dynamic> entry) {
    final timetable = entry['timetableVersion']['timetable'];
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          width: 4,
          height: 40,
          decoration: BoxDecoration(color: AppTheme.primaryColor, borderRadius: BorderRadius.circular(2)),
        ),
        title: Text('${timetable['class']['name']}-${timetable['section']['name']} • ${entry['subject']['name']}', 
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text('${entry['period']['startTime']} - ${entry['period']['endTime']} • Room ${entry['room']?['name'] ?? 'TBA'}', 
          style: const TextStyle(fontSize: 12)),
        trailing: const Icon(Icons.chevron_right, color: Colors.black12),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final String sub;
  final IconData icon;
  final Color color;

  const _StatCard({required this.label, required this.value, required this.sub, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: AppTheme.navyColor)),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black54)),
          Text(sub, style: const TextStyle(fontSize: 10, color: Colors.black26)),
        ],
      ),
    );
  }
}
