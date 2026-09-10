import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/student_bloc.dart';
import '../bloc/student_event.dart';
import '../bloc/student_state.dart';
import '../../../../theme/app_theme.dart';

class StudentHomePage extends StatelessWidget {
  const StudentHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<StudentBloc, StudentState>(
      builder: (context, state) {
        if (state.isLoading && state.dashboard == null) {
          return const Center(child: CircularProgressIndicator());
        }

        final dashboard = state.dashboard;
        if (dashboard == null) {
          return const Center(child: Text('Failed to load dashboard'));
        }

        final student = dashboard.student;
        final enrollment = student['enrollments'][0];

        return RefreshIndicator(
          onRefresh: () async {
            context.read<StudentBloc>().add(LoadStudentDashboard());
          },
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              _buildProfileHeader(student, enrollment),
              const SizedBox(height: 24),
              _buildTodaySummary(dashboard.timetableToday),
              const SizedBox(height: 24),
              _buildAcademicStats(dashboard),
              const SizedBox(height: 24),
              _buildPendingHomework(dashboard.pendingHomework),
              const SizedBox(height: 24),
              _buildUpcomingExams(dashboard.upcomingExams),
            ],
          ),
        );
      },
    );
  }

  Widget _buildProfileHeader(Map<String, dynamic> student, Map<String, dynamic> enrollment) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.navyColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: AppTheme.navyColor.withOpacity(0.2), blurRadius: 15, offset: const Offset(0, 10))],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: Colors.white24,
            child: Text(student['firstName'][0], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${student['firstName']} ${student['lastName']}',
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  '${enrollment['class']['name']}-${enrollment['section']['name']}',
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                ),
                Text(
                  'ID: ${student['admissionNumber']}',
                  style: const TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTodaySummary(List<dynamic> timetable) {
    if (timetable.isEmpty) return const SizedBox.shrink();
    
    final current = timetable.first; // Simplified logic for demo
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.schedule, color: AppTheme.primaryColor, size: 20),
              const SizedBox(width: 8),
              const Text('Happening Now', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            current['subject']['name'],
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.navyColor),
          ),
          Text(
            'Room ${current['room']?['name'] ?? 'TBA'} • ${current['period']['startTime']} - ${current['period']['endTime']}',
            style: const TextStyle(fontSize: 13, color: Colors.black45, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildAcademicStats(dynamic dashboard) {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            label: 'Attendance',
            value: '94%',
            icon: Icons.check_circle_outline,
            color: Colors.green,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _StatCard(
            label: 'Assignments',
            value: dashboard.pendingHomework.length.toString(),
            icon: Icons.assignment_outlined,
            color: Colors.blue,
          ),
        ),
      ],
    );
  }

  Widget _buildPendingHomework(List<dynamic> homework) {
    if (homework.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Homework Due', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        ...homework.map((h) => Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            title: Text(h['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: Text('Due: ${h['dueDate']}', style: const TextStyle(fontSize: 12)),
            trailing: const Icon(Icons.chevron_right, color: Colors.black12),
          ),
        )).toList(),
      ],
    );
  }

  Widget _buildUpcomingExams(List<dynamic> exams) {
    if (exams.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Upcoming Exams', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        ...exams.map((e) => Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: const Icon(Icons.event_note, color: Colors.orange),
            title: Text(e['subject']['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: Text('${e['examination']['name']} • ${e['date']}', style: const TextStyle(fontSize: 12)),
          ),
        )).toList(),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({required this.label, required this.value, required this.icon, required this.color});

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
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.black38, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
