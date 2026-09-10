import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class ParentNotificationsPage extends StatelessWidget {
  const ParentNotificationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Reusing the NotificationCenter logic but as a full page if needed
    return Scaffold(
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: const [
          NotificationTile(
            title: 'Student Absence', 
            body: 'Alice was marked absent today.', 
            time: '2m ago', 
            icon: Icons.person_off, 
            color: Colors.red
          ),
          NotificationTile(
            title: 'Fee Payment', 
            body: 'Payment of ₹12,500 received.', 
            time: '1h ago', 
            icon: Icons.payments, 
            color: Colors.green
          ),
          NotificationTile(
            title: 'New Homework', 
            body: 'Mathematics assignment posted.', 
            time: '3h ago', 
            icon: Icons.assignment, 
            color: Colors.blue
          ),
        ],
      ),
    );
  }
}

class NotificationTile extends StatelessWidget {
  final String title;
  final String body;
  final String time;
  final IconData icon;
  final Color color;

  const NotificationTile({super.key, required this.title, required this.body, required this.time, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.navyColor)),
        subtitle: Text(body, style: const TextStyle(fontSize: 12)),
        trailing: Text(time, style: const TextStyle(fontSize: 10, color: Colors.black26)),
      ),
    );
  }
}
