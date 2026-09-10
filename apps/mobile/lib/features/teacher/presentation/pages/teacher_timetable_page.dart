import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/teacher_bloc.dart';
import '../bloc/teacher_event.dart';
import '../bloc/teacher_state.dart';
import '../../../../theme/app_theme.dart';

class TeacherTimetablePage extends StatefulWidget {
  const TeacherTimetablePage({super.key});

  @override
  State<TeacherTimetablePage> createState() => _TeacherTimetablePageState();
}

class _TeacherTimetablePageState extends State<TeacherTimetablePage> {
  @override
  void initState() {
    super.initState();
    context.read<TeacherBloc>().add(LoadTeacherTimetable());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TeacherBloc, TeacherState>(
      builder: (context, state) {
        if (state.isLoading && state.timetable.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final timetable = state.timetable;
        if (timetable.isEmpty) {
          return const Center(child: Text('No published timetable found'));
        }

        // Group by dayOfWeek
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
                ...dayEntries.map((entry) {
                  final t = entry['timetableVersion']['timetable'];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      dense: true,
                      leading: Text(entry['period']['startTime'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryColor)),
                      title: Text('${t['class']['name']}-${t['section']['name']} • ${entry['subject']['name']}', 
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      subtitle: Text('Room ${entry['room']?['name'] ?? 'TBA'}', style: const TextStyle(fontSize: 11)),
                    ),
                  );
                }).toList(),
                const SizedBox(height: 16),
              ],
            );
          },
        );
      },
    );
  }
}
