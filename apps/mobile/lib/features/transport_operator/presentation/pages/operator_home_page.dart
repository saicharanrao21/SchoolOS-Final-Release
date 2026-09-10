import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/transport_operator_bloc.dart';
import '../bloc/transport_operator_event.dart';
import '../bloc/transport_operator_state.dart';
import '../../../../theme/app_theme.dart';

class OperatorHomePage extends StatelessWidget {
  const OperatorHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TransportOperatorBloc, TransportOperatorState>(
      builder: (context, state) {
        if (state.isLoading && state.dashboard == null) {
          return const Center(child: CircularProgressIndicator());
        }

        final dashboard = state.dashboard;
        if (dashboard == null) {
          return const Center(child: Text('No assigned trips for today'));
        }

        final activeTrip = dashboard['activeTrip'];
        final profile = dashboard['profile'];

        return RefreshIndicator(
          onRefresh: () async {
            context.read<TransportOperatorBloc>().add(LoadOperatorDashboard());
          },
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              _buildProfileHeader(profile),
              const SizedBox(height: 24),
              if (activeTrip != null) 
                _buildActiveTripCard(context, activeTrip)
              else 
                _buildNoTripCard(),
              const SizedBox(height: 24),
              _buildSafetyGuidelines(),
            ],
          ),
        );
      },
    );
  }

  Widget _buildProfileHeader(Map<String, dynamic> profile) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Operator Console', style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.1)),
        const SizedBox(height: 4),
        Text('${profile['firstName']} ${profile['lastName']}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
        Text('ID: ${profile['employeeId']}', style: TextStyle(fontSize: 13, color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildActiveTripCard(BuildContext context, Map<String, dynamic> trip) {
    final bool isStarted = trip['status'] != 'PLANNED';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isStarted ? AppTheme.primaryColor : AppTheme.borderColor),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15, offset: const Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('CURRENT ASSIGNMENT', style: TextStyle(color: Colors.black38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: isStarted ? Colors.green[50] : Colors.blue[50], borderRadius: BorderRadius.circular(6)),
                child: Text(trip['status'], style: TextStyle(color: isStarted ? Colors.green : Colors.blue, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(trip['route']['name'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
          const SizedBox(height: 4),
          Text('Vehicle: ${trip['vehicle']['vehicleNumber']} • ${trip['direction']}', style: const TextStyle(fontSize: 13, color: Colors.black54)),
          const SizedBox(height: 24),
          if (!isStarted)
            ElevatedButton(
              onPressed: () {
                context.read<TransportOperatorBloc>().add(StartOperatorTrip(trip['id']));
              },
              style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 56), backgroundColor: Colors.green),
              child: const Text('START TRIP', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
            )
          else
            Column(
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    // Navigate to Manifest
                  },
                  icon: const Icon(Icons.people_alt_rounded),
                  label: const Text('VIEW MANIFEST'),
                  style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () {
                    context.read<TransportOperatorBloc>().add(TriggerOperatorSos(tripId: trip['id']));
                  },
                  icon: const Icon(Icons.warning_amber_rounded),
                  label: const Text('EMERGENCY SOS'),
                  style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 50), foregroundColor: Colors.red, side: const BorderSide(color: Colors.red)),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildNoTripCard() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(24), border: Border.all(color: AppTheme.borderColor, style: BorderStyle.solid)),
      child: const Column(
        children: [
          Icon(Icons.event_busy_rounded, size: 48, color: Colors.black12),
          SizedBox(height: 16),
          Text('No Trips Assigned', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black38)),
          Text('Check back later for your next route.', style: TextStyle(fontSize: 12, color: Colors.black26)),
        ],
      ),
    );
  }

  Widget _buildSafetyGuidelines() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.orange[50], borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.orange[100]!)),
      child: const Column(
        children: [
          Row(
            children: [
              Icon(Icons.security_rounded, color: Colors.orange, size: 20),
              SizedBox(width: 12),
              Text('Safety Principle', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.orange)),
            ],
          ),
          SizedBox(height: 12),
          Text(
            'Do not interact with the application while the vehicle is in motion. Use the app only when stopped at a station.',
            style: TextStyle(fontSize: 12, color: Colors.orange, height: 1.5, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
