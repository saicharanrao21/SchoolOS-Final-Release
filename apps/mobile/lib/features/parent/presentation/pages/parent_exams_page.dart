import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/parent_bloc.dart';
import '../bloc/parent_event.dart';
import '../bloc/parent_state.dart';
import '../../../../theme/app_theme.dart';

class ParentExamsPage extends StatefulWidget {
  const ParentExamsPage({super.key});

  @override
  State<ParentExamsPage> createState() => _ParentExamsPageState();
}

class _ParentExamsPageState extends State<ParentExamsPage> {
  @override
  void initState() {
    super.initState();
    context.read<ParentBloc>().add(LoadExams());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ParentBloc, ParentState>(
      builder: (context, state) {
        if (state.isLoading && state.exams == null) {
          return const Center(child: CircularProgressIndicator());
        }

        final exams = state.exams;
        if (exams == null || exams.isEmpty) return const Center(child: Text('No exams scheduled'));

        return ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: exams.length,
          itemBuilder: (context, index) {
            final exam = exams[index];
            return _buildExamSection(exam);
          },
        );
      },
    );
  }

  Widget _buildExamSection(Map<String, dynamic> exam) {
    final results = exam['results'] as List<dynamic>;
    final hasResult = results.isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Text(exam['name'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        ),
        if (hasResult) ...[
          _buildResultSummary(results.first),
        ] else ...[
          _buildScheduleList(exam['schedules']),
        ],
        const Divider(height: 48),
      ],
    );
  }

  Widget _buildResultSummary(Map<String, dynamic> result) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppTheme.primaryColor, AppTheme.primaryColor.withOpacity(0.8)]),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('EXAMINATION RESULT', style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                child: const Text('PUBLISHED', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text('${result['percentage']}', style: const TextStyle(color: Colors.white, fontSize: 48, fontWeight: FontWeight.bold)),
              const Text('%', style: TextStyle(color: Colors.white70, fontSize: 24, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          Text('Grade: ${result['overallResult']}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppTheme.primaryColor, minimumSize: const Size(double.infinity, 50)),
            child: const Text('VIEW DETAILED REPORT'),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleList(List<dynamic> schedules) {
    return Column(
      children: schedules.map((s) => Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: ListTile(
          title: Text(s['subject']['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          subtitle: Text('${s['date']} • ${s['startTime']}', style: const TextStyle(fontSize: 12)),
          trailing: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: AppTheme.backgroundColor, borderRadius: BorderRadius.circular(20)),
            child: Text(s['room']?['name'] ?? 'TBA', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black45)),
          ),
        ),
      )).toList(),
    );
  }
}
