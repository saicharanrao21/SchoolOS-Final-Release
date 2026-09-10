import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/parent_bloc.dart';
import '../bloc/parent_event.dart';
import '../bloc/parent_state.dart';
import '../../../../theme/app_theme.dart';

class ParentFeesPage extends StatefulWidget {
  const ParentFeesPage({super.key});

  @override
  State<ParentFeesPage> createState() => _ParentFeesPageState();
}

class _ParentFeesPageState extends State<ParentFeesPage> {
  @override
  void initState() {
    super.initState();
    context.read<ParentBloc>().add(LoadFinance());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ParentBloc, ParentState>(
      builder: (context, state) {
        if (state.isLoading && state.finance == null) {
          return const Center(child: CircularProgressIndicator());
        }

        final finance = state.finance;
        if (finance == null) return const Center(child: Text('Failed to load finance data'));

        final invoices = finance['invoices'] as List<dynamic>;

        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _buildBalanceSummary(finance['account']),
            const SizedBox(height: 32),
            const Text('Fee Demands', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
            const SizedBox(height: 16),
            ...invoices.map((inv) => _buildInvoiceCard(inv)).toList(),
          ],
        );
      },
    );
  }

  Widget _buildBalanceSummary(Map<String, dynamic>? account) {
    final balance = double.tryParse(account?['balance']?.toString() ?? '0') ?? 0;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppTheme.navyColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: AppTheme.navyColor.withOpacity(0.2), blurRadius: 15, offset: const Offset(0, 10))],
      ),
      child: Column(
        children: [
          const Text('TOTAL OUTSTANDING', style: TextStyle(color: Colors.white60, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 8),
          Text('₹${balance.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          if (balance > 0)
            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppTheme.navyColor,
                minimumSize: const Size(200, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('PAY NOW', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
        ],
      ),
    );
  }

  Widget _buildInvoiceCard(Map<String, dynamic> inv) {
    final isPaid = inv['status'] == 'PAID';
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        title: Text(inv['invoiceNumber'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('Due Date: ${inv['dueDate']}', style: const TextStyle(fontSize: 12, color: Colors.black38)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: isPaid ? Colors.green[50] : Colors.orange[50],
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(inv['status'], style: TextStyle(color: isPaid ? Colors.green : Colors.orange, fontSize: 10, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        trailing: Text('₹${inv['totalAmount']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.navyColor)),
      ),
    );
  }
}
