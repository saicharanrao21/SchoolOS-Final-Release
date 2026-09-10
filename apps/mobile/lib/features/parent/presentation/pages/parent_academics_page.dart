import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/parent_bloc.dart';
import '../bloc/parent_event.dart';
import '../bloc/parent_state.dart';
import '../../../../theme/app_theme.dart';

class ParentAcademicsPage extends StatefulWidget {
  const ParentAcademicsPage({super.key});

  @override
  State<ParentAcademicsPage> createState() => _ParentAcademicsPageState();
}

class _ParentAcademicsPageState extends State<ParentAcademicsPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<ParentBloc>().add(LoadAcademics());
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
              Tab(text: 'Homework'),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildTimetableTab(),
              _buildHomeworkTab(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTimetableTab() {
    return BlocBuilder<ParentBloc, ParentState>(
      builder: (context, state) {
        if (state.isLoading) return const Center(child: CircularProgressIndicator());
        
        final timetable = state.academics?['timetable'];
        if (timetable == null) return const Center(child: Text('No timetable found'));

        final entries = timetable['entries'] as List<dynamic>;
        
        return ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: entries.length,
          itemBuilder: (context, index) {
            final entry = entries[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                leading: Container(
                  width: 60,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(color: AppTheme.primaryColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(entry['period']['startTime'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                      const Text('to', style: TextStyle(fontSize: 8, color: Colors.black26)),
                      Text(entry['period']['endTime'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                    ],
                  ),
                ),
                title: Text(entry['subject']['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                subtitle: Text('${entry['employee']['firstName']} • ${entry['room']?['name'] ?? 'N/A'}', style: const TextStyle(fontSize: 12)),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildHomeworkTab() {
    return BlocBuilder<ParentBloc, ParentState>(
      builder: (context, state) {
        if (state.isLoading) return const Center(child: CircularProgressIndicator());

        final assignments = state.academics?['assignments'] as List<dynamic>?;
        if (assignments == null || assignments.isEmpty) return const Center(child: Text('No homework assigned'));

        return ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: assignments.length,
          itemBuilder: (context, index) {
            final a = assignments[index];
            final status = a['submissions']?.isEmpty ?? true ? 'PENDING' : 'SUBMITTED';
            
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
                        Text(a['subject']['name'], style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 12)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: status == 'PENDING' ? Colors.orange[50] : Colors.green[50],
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(status, style: TextStyle(color: status == 'PENDING' ? Colors.orange : Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(a['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.navyColor)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.access_time, size: 14, color: Colors.black38),
                        const SizedBox(width: 6),
                        Text('Due: ${a['dueDate']}', style: const TextStyle(fontSize: 12, color: Colors.black54)),
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
}
