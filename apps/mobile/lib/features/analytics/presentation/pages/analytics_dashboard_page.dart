import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class AnalyticsDashboardPage extends StatelessWidget {
  const AnalyticsDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('Enterprise Insights', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 8),
        const Text('Strategic data and performance analytics', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
        const SizedBox(height: 32),
        _buildMainKpi(),
        const SizedBox(height: 32),
        const Text('Key Metrics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 1.4,
          children: [
            _buildMiniKpi('Admissions', '42', '+5%', Colors.blue),
            _buildMiniKpi('Attendance', '94%', '-2%', Colors.green),
            _buildMiniKpi('Revenue', '₹1.2L', '+12%', Colors.indigo),
            _buildMiniKpi('Incidents', '02', '-40%', Colors.red),
          ],
        ),
        const SizedBox(height: 32),
        const Text('Trends', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        const SizedBox(height: 16),
        _buildTrendCard('Student Population', 'Up 12% from last term'),
        _buildTrendCard('Fee Collection', 'On track for monthly target'),
      ],
    );
  }

  Widget _buildMainKpi() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.navyColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: AppTheme.navyColor.withOpacity(0.2), blurRadius: 15, offset: const Offset(0, 10))],
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('TOTAL REVENUE (AY 26-27)', style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          SizedBox(height: 12),
          Text('₹4.24 Crores', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
          SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.trending_up, color: Colors.green, size: 16),
              SizedBox(width: 4),
              Text('24.2% higher than previous year', style: TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMiniKpi(String label, String value, String trend, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 10, color: Colors.black38, fontWeight: FontWeight.bold)),
              Text(trend, style: TextStyle(fontSize: 9, color: trend.startsWith('+') ? Colors.green : Colors.red, fontWeight: FontWeight.bold)),
            ],
          ),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        ],
      ),
    );
  }

  Widget _buildTrendCard(String title, String sub) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: const Icon(Icons.show_chart_rounded, color: AppTheme.primaryColor),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(sub, style: const TextStyle(fontSize: 12, color: Colors.black38)),
        trailing: const Icon(Icons.chevron_right, size: 16, color: Colors.black12),
      ),
    );
  }
}
