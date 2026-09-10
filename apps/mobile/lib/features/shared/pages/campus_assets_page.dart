import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class CampusAssetsPage extends StatelessWidget {
  const CampusAssetsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('Inventory & Assets', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 8),
        const Text('Manage institutional supplies and physical assets', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
        const SizedBox(height: 32),
        _buildScannerShortcut(context),
        const SizedBox(height: 32),
        const Text('Categories', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        _buildCategoryCard('Inventory Stock', 'Consumables, Stationery, Labs', Icons.inventory_2_rounded, Colors.blue),
        _buildCategoryCard('Fixed Assets', 'IT Equipment, Furniture, Vehicles', Icons.account_balance_wallet_rounded, Colors.indigo),
        _buildCategoryCard('Issues & Returns', 'Track allocations to staff/rooms', Icons.sync_alt_rounded, Colors.teal),
        const SizedBox(height: 32),
        const Text('Quick Status', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        _buildStatusItem('Low Stock Alerts', '12 items below reorder level', Colors.red),
        _buildStatusItem('Pending Maintenance', '8 assets due for service', Colors.orange),
      ],
    );
  }

  Widget _buildScannerShortcut(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: AppTheme.primaryColor.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(16)),
            child: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 32),
          ),
          const SizedBox(width: 20),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Asset Scanner', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                Text('Scan barcode to view details or record movement', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryCard(String title, String sub, IconData icon, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.navyColor)),
        subtitle: Text(sub, style: const TextStyle(fontSize: 11, color: Colors.black38, fontWeight: FontWeight.bold)),
        trailing: const Icon(Icons.chevron_right, size: 20, color: Colors.black12),
      ),
    );
  }

  Widget _buildStatusItem(String label, String value, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
          Text(value, style: const TextStyle(color: Colors.black54, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
