import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class MyPayslipsPage extends StatelessWidget {
  const MyPayslipsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('My Payslips', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 8),
        const Text('View and download your monthly compensation statements', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
        const SizedBox(height: 32),
        _buildPayslipCard('August 2026', '₹48,500.00', 'Paid on Aug 31', Colors.green),
        _buildPayslipCard('July 2026', '₹48,500.00', 'Paid on Jul 31', Colors.green),
        _buildPayslipCard('June 2026', '₹47,200.00', 'Paid on Jun 30', Colors.green),
        _buildPayslipCard('May 2026', '₹47,200.00', 'Paid on May 31', Colors.green),
      ],
    );
  }

  Widget _buildPayslipCard(String month, String amount, String sub, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: Icon(Icons.receipt_long_rounded, color: color),
        ),
        title: Text(month, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.navyColor)),
        subtitle: Text(sub, style: const TextStyle(fontSize: 12, color: Colors.black38, fontWeight: FontWeight.bold)),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(amount, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.navyColor, fontSize: 14)),
            const SizedBox(height: 4),
            const Icon(Icons.download_for_offline_rounded, color: AppTheme.primaryColor, size: 20),
          ],
        ),
      ),
    );
  }
}
