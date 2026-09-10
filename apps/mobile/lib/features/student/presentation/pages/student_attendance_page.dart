import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/student_bloc.dart';
import '../bloc/student_event.dart';
import '../bloc/student_state.dart';
import '../../../../theme/app_theme.dart';
import 'package:intl/intl.dart';

class StudentAttendancePage extends StatefulWidget {
  const StudentAttendancePage({super.key});

  @override
  State<StudentAttendancePage> createState() => _StudentAttendancePageState();
}

class _StudentAttendancePageState extends State<StudentAttendancePage> {
  @override
  void initState() {
    super.initState();
    context.read<StudentBloc>().add(LoadStudentAttendance());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<StudentBloc, StudentState>(
      builder: (context, state) {
        if (state.isLoading && state.attendance.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final attendance = state.attendance;
        if (attendance.isEmpty) {
          return const Center(child: Text('No attendance records found'));
        }

        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _buildStatsHeader(),
            const SizedBox(height: 32),
            const Text('Attendance History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
            const SizedBox(height: 16),
            ...attendance.map((r) => _buildRecordCard(r)).toList(),
          ],
        );
      },
    );
  }

  Widget _buildStatsHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderColor),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          const Text('OVERALL ATTENDANCE', style: TextStyle(color: Colors.black38, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 12),
          const Text('94.2%', style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStatMini('Present', '142', Colors.green),
              _buildStatMini('Absent', '8', Colors.red),
              _buildStatMini('Late', '4', Colors.orange),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatMini(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.black38, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildRecordCard(Map<String, dynamic> r) {
    final date = DateTime.parse(r['session']['date']);
    final status = r['status'] as String;
    
    Color statusColor = Colors.grey;
    if (status == 'PRESENT') statusColor = Colors.green;
    if (status == 'ABSENT') statusColor = Colors.red;
    if (status == 'LATE') statusColor = Colors.orange;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: statusColor.withOpacity(0.1),
          child: Text(DateFormat('dd').format(date), style: TextStyle(color: statusColor, fontWeight: FontWeight.bold)),
        ),
        title: Text(DateFormat('MMMM yyyy').format(date), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(DateFormat('EEEE').format(date), style: const TextStyle(fontSize: 12)),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(color: statusColor, borderRadius: BorderRadius.circular(20)),
          child: Text(status, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
