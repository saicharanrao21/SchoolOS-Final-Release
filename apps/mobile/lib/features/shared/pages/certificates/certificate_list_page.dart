import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class CertificateListPage extends StatelessWidget {
  const CertificateListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('My Certificates', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 8),
        const Text('Download or share your verified institutional credentials', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
        const SizedBox(height: 32),
        _buildCertCard('Study Certificate', 'Academic Year 2026-27', 'Issued on Sept 01', 'CERT-2026-00142', Colors.blue),
        _buildCertCard('Participation Cert', 'Annual Science Fair', 'Issued on Aug 24', 'CERT-2026-00084', Colors.purple),
        _buildCertCard('Conduct Certificate', 'Grade 9 Final', 'Issued on April 12', 'CERT-2026-00021', Colors.teal),
      ],
    );
  }

  Widget _buildCertCard(String title, String sub, String date, String number, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(24),
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
                child: Text('VERIFIED', style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
              ),
              const Icon(Icons.verified_rounded, color: Colors.blue, size: 20),
            ],
          ),
          const SizedBox(height: 20),
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
          Text(sub, style: const TextStyle(fontSize: 12, color: Colors.black45, fontWeight: FontWeight.w500)),
          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(number, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                  Text(date, style: const TextStyle(fontSize: 10, color: Colors.black26, fontWeight: FontWeight.bold)),
                ],
              ),
              Row(
                children: [
                  IconButton(onPressed: () {}, icon: const Icon(Icons.share_rounded, size: 20, color: Colors.black38)),
                  IconButton(onPressed: () {}, icon: const Icon(Icons.download_for_offline_rounded, size: 20, color: AppTheme.primaryColor)),
                ],
              )
            ],
          )
        ],
      ),
    );
  }
}
