import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:schoolos_mobile/features/transport_operator/presentation/bloc/transport_operator_bloc.dart';
import 'package:schoolos_mobile/features/transport_operator/presentation/bloc/transport_operator_event.dart';
import 'package:schoolos_mobile/features/transport_operator/presentation/bloc/transport_operator_state.dart';
import '../../../../theme/app_theme.dart';

class OperatorTripPage extends StatelessWidget {
  const OperatorTripPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TransportOperatorBloc, TransportOperatorState>(
      builder: (context, state) {
        final trip = state.dashboard?['activeTrip'];
        if (trip == null) return const Center(child: Text('No active trip'));

        final stops = trip['route']['stops'] as List<dynamic>;

        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _buildTripHeader(trip),
            const SizedBox(height: 24),
            _buildActionButtons(context, trip),
            const SizedBox(height: 32),
            const Text('Route Progress', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
            const SizedBox(height: 16),
            ...stops.map((stop) => _buildStopItem(stop)).toList(),
          ],
        );
      },
    );
  }

  Widget _buildActionButtons(BuildContext context, Map<String, dynamic> trip) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () {
               // Show checklist dialog
            },
            icon: const Icon(Icons.fact_check_outlined),
            label: const Text('CHECKLIST'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () {
              context.read<TransportOperatorBloc>().add(CompleteOperatorTrip(trip['id']));
            },
            icon: const Icon(Icons.check_circle_outline),
            label: const Text('END TRIP'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
          ),
        ),
      ],
    );
  }

  Widget _buildTripHeader(Map<String, dynamic> trip) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.navyColor,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('ACTIVE ROUTE', style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 8),
          Text(trip['route']['name'], style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildTripStat('Vehicle', trip['vehicle']['vehicleNumber']),
              _buildTripStat('Stops', '${trip['route']['stops'].length}'),
              _buildTripStat('Capacity', '${trip['vehicle']['capacity']}'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTripStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildStopItem(Map<String, dynamic> stop) {
    return Container(
      margin: const EdgeInsets.only(bottom: 0),
      child: IntrinsicHeight(
        child: Row(
          children: [
            Column(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)),
                ),
                Expanded(
                  child: Container(width: 2, color: AppTheme.borderColor),
                ),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(stop['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.navyColor)),
                    const SizedBox(height: 4),
                    Text('Planned: ${stop['plannedTime'] ?? 'TBA'}', style: const TextStyle(fontSize: 12, color: Colors.black38, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
