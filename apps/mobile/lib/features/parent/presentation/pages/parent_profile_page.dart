import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class ParentProfilePage extends StatelessWidget {
  const ParentProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _buildProfileHeader(),
        const SizedBox(height: 40),
        _buildMenuSection('Settings', [
          _MenuItem(label: 'Notification Preferences', icon: Icons.notifications_outlined, color: Colors.blue),
          _MenuItem(label: 'Language', icon: Icons.language, color: Colors.orange, sub: 'English'),
          _MenuItem(label: 'Security & Password', icon: Icons.security_outlined, color: Colors.green),
        ]),
        const SizedBox(height: 32),
        _buildMenuSection('Support', [
          _MenuItem(label: 'Help Center', icon: Icons.help_outline, color: Colors.purple),
          _MenuItem(label: 'Contact School', icon: Icons.school_outlined, color: Colors.teal),
          _MenuItem(label: 'Privacy Policy', icon: Icons.privacy_tip_outlined, color: Colors.grey),
        ]),
        const SizedBox(height: 48),
        TextButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.logout_rounded, color: Colors.red),
          label: const Text('Logout Session', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            backgroundColor: Colors.red.withOpacity(0.05),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
        ),
        const SizedBox(height: 24),
        const Center(child: Text('Version 1.0.0 (Build 24)', style: TextStyle(fontSize: 10, color: Colors.black26, fontWeight: FontWeight.bold))),
      ],
    );
  }

  Widget _buildProfileHeader() {
    return Column(
      children: [
        Stack(
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.primaryColor, width: 2),
                image: const DecorationImage(image: NetworkImage('https://api.dicebear.com/7.x/avataaars/png?seed=Robert'), fit: BoxFit.cover),
              ),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle),
                child: const Icon(Icons.camera_alt, color: Colors.white, size: 16),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const Text('Robert Johnson', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const Text('robert.j@example.com', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildMenuSection(String title, List<Widget> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black26, letterSpacing: 1.1)),
        const SizedBox(height: 16),
        ...items,
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final String? sub;

  const _MenuItem({required this.label, required this.icon, required this.color, this.sub});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.navyColor)),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (sub != null) Text(sub!, style: const TextStyle(fontSize: 12, color: Colors.black26, fontWeight: FontWeight.bold)),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, size: 16, color: Colors.black12),
          ],
        ),
      ),
    );
  }
}
