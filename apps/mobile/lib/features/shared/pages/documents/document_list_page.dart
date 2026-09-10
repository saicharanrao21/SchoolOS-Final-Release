import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class DocumentListPage extends StatelessWidget {
  const DocumentListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('Document Vault', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 8),
        const Text('Secure access to your institutional records', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
        const SizedBox(height: 32),
        _buildDocumentItem('Identity Proof', 'Aadhaar Card • Verified', 'Aug 24, 2026', Icons.badge_rounded, Colors.blue),
        _buildDocumentItem('Address Proof', 'Utility Bill • Under Review', 'Sept 01, 2026', Icons.home_work_rounded, Colors.orange),
        _buildDocumentItem('Medical Record', 'Vaccination Cert • Active', 'July 12, 2026', Icons.medical_services_rounded, Colors.green),
        _buildDocumentItem('Previous School TC', 'Transfer Cert • Verified', 'Aug 10, 2024', Icons.school_rounded, Colors.indigo),
        const SizedBox(height: 40),
        ElevatedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.upload_file_rounded),
          label: const Text('UPLOAD NEW DOCUMENT'),
          style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 56)),
        ),
      ],
    );
  }

  Widget _buildDocumentItem(String title, String sub, String date, IconData icon, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.navyColor)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(sub, style: const TextStyle(fontSize: 11, color: Colors.black45, fontWeight: FontWeight.w500)),
            Text(date, style: const TextStyle(fontSize: 10, color: Colors.black26, fontWeight: FontWeight.bold)),
          ],
        ),
        trailing: const Icon(Icons.more_vert_rounded, color: Colors.black12),
      ),
    );
  }
}
