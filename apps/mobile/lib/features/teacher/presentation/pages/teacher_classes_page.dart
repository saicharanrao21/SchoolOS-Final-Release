import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/teacher_bloc.dart';
import '../bloc/teacher_event.dart';
import '../bloc/teacher_state.dart';
import 'teacher_students_page.dart';
import '../../../../theme/app_theme.dart';

class TeacherClassesPage extends StatefulWidget {
  const TeacherClassesPage({super.key});

  @override
  State<TeacherClassesPage> createState() => _TeacherClassesPageState();
}

class _TeacherClassesPageState extends State<TeacherClassesPage> {
  @override
  void initState() {
    super.initState();
    context.read<TeacherBloc>().add(LoadTeacherClasses());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TeacherBloc, TeacherState>(
      builder: (context, state) {
        if (state.isLoading && state.classes.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final classes = state.classes;
        if (classes.isEmpty) {
          return const Center(child: Text('No assigned classes found'));
        }

        return ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: classes.length,
          itemBuilder: (context, index) {
            final c = classes[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                leading: CircleAvatar(
                  backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                  child: const Icon(Icons.class_outlined, color: AppTheme.primaryColor),
                ),
                title: Text('${c['class']['name']} - ${c['section']['name']}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
                subtitle: Text(c['subject']['name'], style: const TextStyle(fontSize: 13, color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                trailing: const Icon(Icons.chevron_right_rounded, color: Colors.black12),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BlocProvider.value(
                        value: context.read<TeacherBloc>(),
                        child: TeacherStudentsPage(
                          classId: c['classId'],
                          sectionId: c['sectionId'],
                          className: '${c['class']['name']}-${c['section']['name']}',
                          subjectName: c['subject']['name'],
                        ),
                      ),
                    ),
                  );
                },
              ),
            );
          },
        );
      },
    );
  }
}
