import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/parent_bloc.dart';
import '../bloc/parent_event.dart';
import '../bloc/parent_state.dart';
import '../../../../theme/app_theme.dart';
import 'package:intl/intl.dart';

class ParentAttendancePage extends StatefulWidget {
  const ParentAttendancePage({super.key});

  @override
  State<ParentAttendancePage> createState() => _ParentAttendancePageState();
}

class _ParentAttendancePageState extends State<ParentAttendancePage> {
  @override
  void initState() {
    super.initState();
    // Assuming we have a way to get current academic year ID, or just pass empty for default
    context.read<ParentBloc>().add(LoadAttendance('current')); 
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ParentBloc, ParentState>(
      builder: (context, state) {
        if (state.isLoading && state.attendance == null) {
          return const Center(child: CircularProgressIndicator());
        }

        final attendance = state.attendance;
        if (attendance == null) return const Center(child: Text('No attendance data available'));

        final records = attendance['records'] as List<dynamic>;
        final stats = attendance['stats'] as Map<String, dynamic>;

        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _buildStatsGrid(stats),
            const SizedBox(height: 32),
            const Text('Attendance History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
            const SizedBox(height: 16),
            ...records.map((r) => _buildRecordCard(r)).toList(),
          ],
        );
      },
    );
  }

  Widget _buildStatsGrid(Map<String, dynamic> stats) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.5,
      children: [
        _buildStatItem('Present', stats['PRESENT']?.toString() ?? '0', Colors.green),
        _buildStatItem('Absent', stats['ABSENT']?.toString() ?? '0', Colors.red),
        _buildStatItem('Late', stats['LATE']?.toString() ?? '0', Colors.orange),
        _buildStatItem('On Leave', stats['ON_LEAVE']?.toString() ?? '0', Colors.blue),
      ],
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black45)),
        ],
      ),
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
