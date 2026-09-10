import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/parent_bloc.dart';
import '../bloc/parent_event.dart';
import '../bloc/parent_state.dart';
import '../../../../theme/app_theme.dart';

class ParentTransportPage extends StatefulWidget {
  const ParentTransportPage({super.key});

  @override
  State<ParentTransportPage> createState() => _ParentTransportPageState();
}

class _ParentTransportPageState extends State<ParentTransportPage> {
  @override
  void initState() {
    super.initState();
    context.read<ParentBloc>().add(LoadTransport());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ParentBloc, ParentState>(
      builder: (context, state) {
        if (state.isLoading && state.transport == null) {
          return const Center(child: CircularProgressIndicator());
        }

        final transport = state.transport;
        if (transport == null) return const Center(child: Text('No transport assignment found'));

        final activeTrip = transport['activeTrip'];
        final assignment = transport['assignment'];

        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _buildLiveStatus(activeTrip),
            const SizedBox(height: 32),
            _buildRouteDetails(assignment),
          ],
        );
      },
    );
  }

  Widget _buildLiveStatus(Map<String, dynamic>? activeTrip) {
    final isActive = activeTrip != null;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isActive ? Colors.blue[50] : Colors.grey[50],
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isActive ? Colors.blue[100]! : Colors.grey[200]!),
      ),
      child: Column(
        children: [
          Icon(
            isActive ? Icons.location_on_rounded : Icons.location_off_rounded,
            color: isActive ? Colors.blue : Colors.grey,
            size: 48,
          ),
          const SizedBox(height: 16),
          Text(
            isActive ? 'Vehicle is On Route' : 'No Active Trip',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: isActive ? Colors.blue[900] : Colors.grey[900]),
          ),
          if (isActive) ...[
             const SizedBox(height: 8),
             Text('Vehicle: ${activeTrip['vehicle']['vehicleNumber']}', style: TextStyle(color: Colors.blue[700], fontSize: 14)),
             const SizedBox(height: 20),
             ElevatedButton.icon(
               onPressed: () {},
               icon: const Icon(Icons.map_outlined),
               label: const Text('TRACK LIVE'),
             ),
          ] else ...[
             const SizedBox(height: 8),
             const Text('Tracking will be available during trip hours.', style: TextStyle(color: Colors.grey, fontSize: 12)),
          ]
        ],
      ),
    );
  }

  Widget _buildRouteDetails(Map<String, dynamic> assignment) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Assigned Route', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        _buildInfoTile('Route Name', assignment['route']['name'], Icons.route),
        _buildInfoTile('Stop Name', assignment['stop']['name'], Icons.location_on),
        _buildInfoTile('Planned Time', assignment['stop']['plannedTime'] ?? 'N/A', Icons.access_time),
      ],
    );
  }

  Widget _buildInfoTile(String label, String value, IconData icon) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.primaryColor, size: 20),
        title: Text(label, style: const TextStyle(fontSize: 11, color: Colors.black45, fontWeight: FontWeight.bold)),
        subtitle: Text(value, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.navyColor, fontSize: 14)),
      ),
    );
  }
}
