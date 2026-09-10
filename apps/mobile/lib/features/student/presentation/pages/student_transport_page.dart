import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class StudentTransportPage extends StatelessWidget {
  const StudentTransportPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('My Transport', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 20),
        _buildActiveStatusCard(),
        const SizedBox(height: 32),
        _buildRouteDetails(),
      ],
    );
  }

  Widget _buildActiveStatusCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.blue[100]!),
      ),
      child: Column(
        children: [
          const Icon(Icons.directions_bus_rounded, color: Colors.blue, size: 48),
          const SizedBox(height: 16),
          const Text('Vehicle is On Route', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1E3A8A))),
          const Text('Bus 04 • North City Express', style: TextStyle(color: Color(0xFF1E40AF), fontSize: 13)),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.map_outlined),
            label: const Text('VIEW LIVE LOCATION'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue[600], foregroundColor: Colors.white),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Pickup Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        _buildInfoTile('Assigned Stop', 'Central Plaza Main Gate', Icons.location_on),
        _buildInfoTile('Pickup Time', '07:45 AM', Icons.access_time),
        _buildInfoTile('Drop Time', '03:45 PM', Icons.access_time),
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
