import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';
import 'my_payslips_page.dart';

class SelfServicePage extends StatelessWidget {
  const SelfServicePage({super.key});

  @override
  Widget build(BuildContext context) {
    final services = [
      {'label': 'My Payslips', 'icon': Icons.payments_rounded, 'color': Colors.blue, 'page': const MyPayslipsPage()},
      {'label': 'Attendance', 'icon': Icons.event_available_rounded, 'color': Colors.green, 'page': const Center(child: Text('My Attendance'))},
      {'label': 'Leave', 'icon': Icons.time_to_leave_rounded, 'color': Colors.orange, 'page': const Center(child: Text('Leave Management'))},
      {'label': 'Documents', 'icon': Icons.file_copy_rounded, 'color': Colors.indigo, 'page': const Center(child: Text('My Documents'))},
      {'label': 'Loans', 'icon': Icons.account_balance_rounded, 'color': Colors.purple, 'page': const Center(child: Text('Loans & Advances'))},
      {'label': 'Reimburse', 'icon': Icons.request_quote_rounded, 'color': Colors.teal, 'page': const Center(child: Text('Reimbursements'))},
    ];

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Self Service', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
            const SizedBox(height: 8),
            const Text('Manage your employment and compensation', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
            const SizedBox(height: 32),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.2,
                ),
                itemCount: services.length,
                itemBuilder: (context, i) {
                  final s = services[i];
                  return Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: AppTheme.borderColor)),
                    child: InkWell(
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => Scaffold(
                          appBar: AppBar(backgroundColor: Colors.white, elevation: 0, iconTheme: const IconThemeData(color: AppTheme.navyColor)),
                          body: s['page'] as Widget,
                        )));
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(color: (s['color'] as Color).withOpacity(0.1), shape: BoxShape.circle),
                            child: Icon(s['icon'] as IconData, color: s['color'] as Color, size: 24),
                          ),
                          const SizedBox(height: 12),
                          Text(s['label'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.navyColor)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
