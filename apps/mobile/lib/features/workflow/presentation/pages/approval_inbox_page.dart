import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class ApprovalInboxPage extends StatelessWidget {
  const ApprovalInboxPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('Approval Inbox', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 8),
        const Text('Review pending institutional requests', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
        const SizedBox(height: 32),
        _buildApprovalCard('Leave Request', 'Alice Johnson • 3 Days', 'Due Today', Colors.orange),
        _buildApprovalCard('Purchase Order', 'PO-00142 • ₹12,400', 'In 2 hours', Colors.blue),
        _buildApprovalCard('Student Pickup', 'Bob Miller • Emergency', 'ASAP', Colors.red),
        _buildApprovalCard('Asset Disposal', 'Old IT Server', 'Tomorrow', Colors.indigo),
      ],
    );
  }

  Widget _buildApprovalCard(String title, String sub, String due, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderColor),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: Text(title.toUpperCase(), style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
              ),
              Text(due, style: const TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),
          Text(sub, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white, elevation: 0),
                  child: const Text('APPROVE'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(foregroundColor: Colors.red, side: const BorderSide(color: Colors.red)),
                  child: const Text('REJECT'),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}
