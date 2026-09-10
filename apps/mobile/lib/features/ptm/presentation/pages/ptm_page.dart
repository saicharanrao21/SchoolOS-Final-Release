import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class PtmPage extends StatelessWidget {
  const PtmPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('Parent Teacher Meetings', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 8),
        const Text('Schedule and manage your institutional meetings', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
        const SizedBox(height: 32),
        _buildBookingCard(),
        const SizedBox(height: 32),
        const Text('Upcoming Meetings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        _buildMeetingCard('Mr. Rajesh Kumar', 'Mathematics', 'Sept 05 • 09:30 AM', 'Confirmed', Colors.green),
        _buildMeetingCard('Ms. Priya Sharma', 'Science', 'Sept 05 • 10:15 AM', 'Scheduled', Colors.blue),
      ],
    );
  }

  Widget _buildBookingCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          const Icon(Icons.people_alt_rounded, color: AppTheme.primaryColor, size: 40),
          const SizedBox(height: 16),
          const Text('Need a meeting?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.navyColor)),
          const Text('Book a slot with your child\'s teacher for the upcoming PTM cycle.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.black45, fontWeight: FontWeight.w500, height: 1.5)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
            child: const Text('BOOK NEW SLOT'),
          ),
        ],
      ),
    );
  }

  Widget _buildMeetingCard(String teacher, String subject, String time, String status, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppTheme.backgroundColor,
                  child: Text(teacher[0], style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(teacher, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.navyColor)),
                      Text(subject, style: const TextStyle(fontSize: 12, color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                  child: Text(status, style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 14, color: Colors.black26),
                    const SizedBox(width: 6),
                    Text(time, style: const TextStyle(fontSize: 12, color: Colors.black54, fontWeight: FontWeight.w500)),
                  ],
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text('RESCHEDULE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                )
              ],
            )
          ],
        ),
      ),
    );
  }
}
