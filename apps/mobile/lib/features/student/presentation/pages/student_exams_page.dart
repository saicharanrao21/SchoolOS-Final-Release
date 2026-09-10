import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/student_bloc.dart';
import '../bloc/student_event.dart';
import '../bloc/student_state.dart';
import '../../../../theme/app_theme.dart';

class StudentExamsPage extends StatefulWidget {
  const StudentExamsPage({super.key});

  @override
  State<StudentExamsPage> createState() => _StudentExamsPageState();
}

class _StudentExamsPageState extends State<StudentExamsPage> {
  @override
  void initState() {
    super.initState();
    // Reusing LoadStudentDashboard for quick data or we could add LoadStudentExams if needed
    context.read<StudentBloc>().add(LoadStudentDashboard());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<StudentBloc, StudentState>(
      builder: (context, state) {
        if (state.isLoading && state.dashboard == null) {
          return const Center(child: CircularProgressIndicator());
        }

        final exams = state.dashboard?.upcomingExams ?? [];

        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text('Exam Schedule', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
            const SizedBox(height: 20),
            if (exams.isEmpty)
              const Center(child: Text('No upcoming exams'))
            else
              ...exams.map((e) => _buildExamCard(e)).toList(),
          ],
        );
      },
    );
  }

  Widget _buildExamCard(Map<String, dynamic> e) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(e['subject']['name'], style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 13)),
                Text(e['date'], style: const TextStyle(color: Colors.black38, fontSize: 12, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            Text(e['examination']['name'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
            const SizedBox(height: 16),
            Row(
              children: [
                _buildInfoBit(Icons.access_time, e['startTime'] ?? 'TBA'),
                const SizedBox(width: 24),
                _buildInfoBit(Icons.location_on_outlined, 'Room 302'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoBit(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.black26),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 13, color: Colors.black54, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
