import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/teacher_bloc.dart';
import '../bloc/teacher_event.dart';
import '../bloc/teacher_state.dart';
import '../../../../theme/app_theme.dart';

class TeacherStudentsPage extends StatefulWidget {
  final String classId;
  final String sectionId;
  final String className;
  final String subjectName;

  const TeacherStudentsPage({
    super.key,
    required this.classId,
    required this.sectionId,
    required this.className,
    required this.subjectName,
  });

  @override
  State<TeacherStudentsPage> createState() => _TeacherStudentsPageState();
}

class _TeacherStudentsPageState extends State<TeacherStudentsPage> {
  @override
  void initState() {
    super.initState();
    context.read<TeacherBloc>().add(LoadClassStudents(widget.classId, widget.sectionId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.className, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.navyColor, fontSize: 18)),
            Text(widget.subjectName, style: const TextStyle(color: Colors.black38, fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.navyColor),
      ),
      body: BlocBuilder<TeacherBloc, TeacherState>(
        builder: (context, state) {
          if (state.isLoading && state.students.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          final students = state.students;
          if (students.isEmpty) {
            return const Center(child: Text('No students found in this section'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: students.length,
            itemBuilder: (context, index) {
              final s = students[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppTheme.backgroundColor,
                    child: Text(s['firstName'][0], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
                  ),
                  title: Text('${s['firstName']} ${s['lastName']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  subtitle: Text('ID: ${s['admissionNumber']}', style: const TextStyle(fontSize: 11, color: Colors.black38)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                       _StatusBadge(label: '92%', color: Colors.green),
                       const SizedBox(width: 8),
                       const Icon(Icons.chevron_right, color: Colors.black12, size: 20),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  const _StatusBadge({required this.label, required this.color});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
      child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}
