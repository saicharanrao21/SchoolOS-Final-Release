import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/student_bloc.dart';
import '../bloc/student_event.dart';
import '../bloc/student_state.dart';
import '../../../../theme/app_theme.dart';

class StudentAcademicsPage extends StatefulWidget {
  const StudentAcademicsPage({super.key});

  @override
  State<StudentAcademicsPage> createState() => _StudentAcademicsPageState();
}

class _StudentAcademicsPageState extends State<StudentAcademicsPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<StudentBloc>().add(LoadStudentTimetable());
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          color: Colors.white,
          child: TabBar(
            controller: _tabController,
            labelColor: AppTheme.primaryColor,
            unselectedLabelColor: Colors.black38,
            indicatorColor: AppTheme.primaryColor,
            labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            tabs: const [
              Tab(text: 'Timetable'),
              Tab(text: 'Curriculum'),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildTimetableTab(),
              const Center(child: Text('Curriculum content coming soon')),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTimetableTab() {
    return BlocBuilder<StudentBloc, StudentState>(
      builder: (context, state) {
        if (state.isLoading && state.timetable.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final timetable = state.timetable;
        if (timetable.isEmpty) {
          return const Center(child: Text('No timetable data available'));
        }

        final days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        return ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: 6, // Mon-Sat
          itemBuilder: (context, dayIndex) {
            final dayOfWeek = dayIndex + 1;
            final dayEntries = timetable.where((e) => e['period']['dayOfWeek'] == dayOfWeek).toList();
            
            if (dayEntries.isEmpty) return const SizedBox.shrink();

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12.0),
                  child: Text(days[dayIndex], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
                ),
                ...dayEntries.map((entry) => Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    dense: true,
                    leading: Text(
                      entry['period']['startTime'], 
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryColor)
                    ),
                    title: Text(entry['subject']['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Text('${entry['employee']['firstName']} • Room ${entry['room']?['name'] ?? 'TBA'}', style: const TextStyle(fontSize: 11)),
                  ),
                )).toList(),
                const SizedBox(height: 16),
              ],
            );
          },
        );
      },
    );
  }
}
