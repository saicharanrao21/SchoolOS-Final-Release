import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/parent_bloc.dart';
import '../bloc/parent_event.dart';
import '../bloc/parent_state.dart';
import '../widgets/child_selector.dart';
import '../../../../theme/app_theme.dart';

class ParentHomePage extends StatelessWidget {
  const ParentHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ParentBloc, ParentState>(
      builder: (context, state) {
        if (state.isLoading && state.dashboard == null) {
          return const Center(child: CircularProgressIndicator());
        }

        final dashboard = state.dashboard;
        if (dashboard == null) {
          return const Center(child: Text('Select a child to view dashboard'));
        }

        return RefreshIndicator(
          onRefresh: () async {
            context.read<ParentBloc>().add(LoadDashboard());
          },
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const ChildSelector(),
              const SizedBox(height: 24),
              _buildAttendanceCard(dashboard.attendanceToday),
              const SizedBox(height: 24),
              _buildAcademicSummary(dashboard),
              const SizedBox(height: 24),
              _buildFeeCard(dashboard.feeSummary),
              const SizedBox(height: 24),
              _buildTransportCard(dashboard.transport),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAttendanceCard(Map<String, dynamic>? attendance) {
    final isPresent = attendance?['status'] == 'PRESENT';
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isPresent ? Colors.green[50] : Colors.red[50],
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isPresent ? Colors.green[100]! : Colors.red[100]!),
      ),
      child: Row(
        children: [
          Icon(
            isPresent ? Icons.check_circle_rounded : Icons.cancel_rounded,
            color: isPresent ? Colors.green : Colors.red,
            size: 40,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isPresent ? 'Present Today' : 'Not Marked Yet',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: isPresent ? Colors.green[900] : Colors.red[900]),
                ),
                Text(
                  attendance?['checkInTime'] != null 
                    ? 'Checked in at ${attendance!['checkInTime']}' 
                    : 'Class starts at 08:30 AM',
                  style: TextStyle(fontSize: 13, color: isPresent ? Colors.green[700] : Colors.red[700]),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAcademicSummary(dynamic dashboard) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Academic Overview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _StatCard(
                label: 'Homework',
                value: dashboard.pendingHomeworkCount.toString(),
                sub: 'Pending',
                icon: Icons.assignment_outlined,
                color: Colors.blue,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _StatCard(
                label: 'Exams',
                value: dashboard.upcomingExams.length.toString(),
                sub: 'Upcoming',
                icon: Icons.event_note_outlined,
                color: Colors.orange,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFeeCard(Map<String, dynamic>? fee) {
    final balanceStr = fee?['balance']?.toString() ?? '0';
    final balance = double.tryParse(balanceStr) ?? 0;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderColor),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Outstanding Fee', style: TextStyle(color: Colors.black54, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text('₹${balance.toStringAsFixed(2)}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
                ],
              ),
              if (balance > 0)
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: Colors.orange.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.priority_high_rounded, color: Colors.orange, size: 20),
                ),
            ],
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 50),
              backgroundColor: AppTheme.primaryColor,
              foregroundColor: Colors.white,
            ),
            child: const Text('View Fee Details'),
          ),
        ],
      ),
    );
  }

  Widget _buildTransportCard(Map<String, dynamic>? transport) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: AppTheme.borderColor)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                const Icon(Icons.directions_bus_rounded, color: AppTheme.primaryColor),
                const SizedBox(width: 12),
                const Text('Transport Status', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.navyColor)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(6)),
                  child: const Text('ON ROUTE', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text('North City Express', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: Text('Current Stop: Sector 14 Main Gate', style: TextStyle(fontSize: 12)),
              trailing: Icon(Icons.map_outlined, color: AppTheme.primaryColor),
            ),
          ],
        ),
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
