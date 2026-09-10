import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/transport_operator_bloc.dart';
import '../bloc/transport_operator_event.dart';
import '../bloc/transport_operator_state.dart';
import '../../../../theme/app_theme.dart';

class OperatorSafetyPage extends StatelessWidget {
  const OperatorSafetyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TransportOperatorBloc, TransportOperatorState>(
      builder: (context, state) {
        final tripId = state.dashboard?['activeTrip']?['id'];

        return ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const Text('Safety Console', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
            const SizedBox(height: 8),
            const Text('Report incidents or trigger emergency alerts immediately.', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
            const SizedBox(height: 32),
            _buildEmergencyAction(context, tripId),
            const SizedBox(height: 40),
            const Text('Operational Incidents', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black26, letterSpacing: 1.1)),
            const SizedBox(height: 16),
            _buildIncidentGrid(context, tripId),
          ],
        );
      },
    );
  }

  Widget _buildEmergencyAction(BuildContext context, String? tripId) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.red[100]!),
      ),
      child: Column(
        children: [
          const Icon(Icons.warning_rounded, color: Colors.red, size: 56),
          const SizedBox(height: 16),
          const Text('Emergency SOS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Colors.red)),
          const SizedBox(height: 8),
          const Text(
            'Pressing SOS will immediately alert school management and transmit your current location.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: Colors.redAccent, height: 1.5),
          ),
          const SizedBox(height: 24),
          GestureDetector(
            onLongPress: () {
               if (tripId != null) {
                 context.read<TransportOperatorBloc>().add(TriggerOperatorSos(tripId: tripId, lat: 0, lng: 0));
               }
            },
            child: Container(
              width: double.infinity,
              height: 64,
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: Colors.red.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
              ),
              child: const Center(
                child: Text('HOLD TO ACTIVATE SOS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIncidentGrid(BuildContext context, String? tripId) {
    final types = [
      {'label': 'Breakdown', 'icon': Icons.car_repair_rounded},
      {'label': 'Accident', 'icon': Icons.minor_crash_rounded},
      {'label': 'Medical', 'icon': Icons.medical_services_outlined},
      {'label': 'Blocked', 'icon': Icons.block_rounded},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisSpacing: 16, crossAxisSpacing: 16, childAspectRatio: 1.3),
      itemCount: types.length,
      itemBuilder: (context, i) {
        return Card(
          margin: EdgeInsets.zero,
          child: InkWell(
            onTap: () {
               // Open detailed incident form
            },
            borderRadius: BorderRadius.circular(12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(types[i]['icon'] as IconData, color: AppTheme.primaryColor),
                const SizedBox(height: 12),
                Text(types[i]['label'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.navyColor)),
              ],
            ),
          ),
        );
      },
    );
  }
}
