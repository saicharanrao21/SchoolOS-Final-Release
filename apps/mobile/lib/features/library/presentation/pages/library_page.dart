import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class LibraryPage extends StatelessWidget {
  const LibraryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('My Library', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 8),
        const Text('Manage your issued books and reservations', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
        const SizedBox(height: 32),
        _buildMembershipCard(),
        const SizedBox(height: 32),
        const Text('Currently Issued', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        _buildBookCard('The Great Gatsby', 'F. Scott Fitzgerald', 'Due: Sept 15', Colors.green),
        _buildBookCard('Advanced Calculus', 'Morris Tenenbaum', 'Due: Sept 12', Colors.red),
        const SizedBox(height: 32),
        const Text('Reservations', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        _buildBookCard('Principles of Physics', 'Halliday Resnick', 'Waitlist: #2', Colors.blue),
      ],
    );
  }

  Widget _buildMembershipCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AppTheme.primaryColor, Color(0xFF6366F1)]),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: AppTheme.primaryColor.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('LIBRARY PASS', style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              Icon(Icons.nfc_rounded, color: Colors.white.withOpacity(0.5)),
            ],
          ),
          const SizedBox(height: 20),
          const Text('GA-LIB-2026-0842', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 2)),
          const SizedBox(height: 4),
          const Text('Member since Aug 2024', style: TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.w500)),
          const SizedBox(height: 24),
          const Row(
            children: [
               _MemberStat(label: 'BOOKS HELD', value: '2'),
               SizedBox(width: 32),
               _MemberStat(label: 'OVERDUE', value: '1'),
               SizedBox(width: 32),
               _MemberStat(label: 'FINES', value: '₹50'),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildBookCard(String title, String author, String sub, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          width: 45,
          height: 60,
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
          child: Icon(Icons.book_rounded, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.navyColor)),
        subtitle: Text(author, style: const TextStyle(fontSize: 12, color: Colors.black38, fontWeight: FontWeight.bold)),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(sub, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
            const Icon(Icons.chevron_right, size: 16, color: Colors.black12),
          ],
        ),
      ),
    );
  }
}

class _MemberStat extends StatelessWidget {
  final String label;
  final String value;
  const _MemberStat({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 8, fontWeight: FontWeight.bold)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
