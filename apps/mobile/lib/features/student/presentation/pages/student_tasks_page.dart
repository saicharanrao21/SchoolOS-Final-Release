import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/student_bloc.dart';
import '../bloc/student_event.dart';
import '../bloc/student_state.dart';
import '../../../../theme/app_theme.dart';

class StudentTasksPage extends StatefulWidget {
  const StudentTasksPage({super.key});

  @override
  State<StudentTasksPage> createState() => _StudentTasksPageState();
}

class _StudentTasksPageState extends State<StudentTasksPage> {
  @override
  void initState() {
    super.initState();
    context.read<StudentBloc>().add(LoadStudentHomework());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<StudentBloc, StudentState>(
      builder: (context, state) {
        if (state.isLoading && state.homework.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final homework = state.homework;
        if (homework.isEmpty) {
          return const Center(child: Text('No homework assignments found'));
        }

        return ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: homework.length,
          itemBuilder: (context, index) {
            final h = homework[index];
            final status = h['submissions']?.isEmpty ?? true ? 'PENDING' : 'SUBMITTED';

            return Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(h['subject']['name'], style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 12)),
                        _buildStatusBadge(status),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(h['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.navyColor)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 14, color: Colors.black38),
                        const SizedBox(width: 6),
                        Text('Due: ${h['dueDate']}', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                        const Spacer(),
                        ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryColor,
                            foregroundColor: Colors.white,
                            minimumSize: const Size(80, 32),
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          child: Text(status == 'PENDING' ? 'SUBMIT' : 'VIEW'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildStatusBadge(String status) {
    final isPending = status == 'PENDING';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isPending ? Colors.orange[50] : Colors.green[50],
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        status, 
        style: TextStyle(color: isPending ? Colors.orange : Colors.green, fontSize: 10, fontWeight: FontWeight.bold)
      ),
    );
  }
}
