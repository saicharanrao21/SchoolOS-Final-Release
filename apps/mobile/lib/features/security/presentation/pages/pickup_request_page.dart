import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class PickupRequestPage extends StatelessWidget {
  const PickupRequestPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('Student Pickup', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 8),
        const Text('Generate secure tokens for authorized student release', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
        const SizedBox(height: 32),
        _buildActiveTokenCard(),
        const SizedBox(height: 32),
        const Text('Authorized Persons', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        _buildPersonTile('John Doe', 'Father (Primary)', true),
        _buildPersonTile('Jane Doe', 'Mother', false),
        const SizedBox(height: 32),
        ElevatedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.add),
          label: const Text('AUTHORIZE NEW PERSON'),
          style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 56)),
        ),
      ],
    );
  }

  Widget _buildActiveTokenCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderColor),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          const Text('TODAY\'S PICKUP TOKEN', style: TextStyle(color: Colors.black38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppTheme.backgroundColor, borderRadius: BorderRadius.circular(16)),
            child: const Icon(Icons.qr_code_2_rounded, size: 120, color: AppTheme.navyColor),
          ),
          const SizedBox(height: 24),
          const Text('842 516', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.primaryColor, letterSpacing: 8)),
          const SizedBox(height: 8),
          const Text('Expires in 14:02', style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 12),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.info_outline_rounded, size: 14, color: Colors.black26),
              SizedBox(width: 8),
              Text('Show this to the security officer at the gate.', style: TextStyle(color: Colors.black45, fontSize: 11, fontWeight: FontWeight.w500)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildPersonTile(String name, String relation, bool isVerified) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: const CircleAvatar(backgroundColor: AppTheme.backgroundColor, child: Icon(Icons.person, color: AppTheme.navyColor)),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(relation, style: const TextStyle(fontSize: 12, color: Colors.black38)),
        trailing: isVerified 
          ? const Icon(Icons.check_circle, color: Colors.green, size: 20)
          : const Icon(Icons.pending_actions_rounded, color: Colors.orange, size: 20),
      ),
    );
  }
}
