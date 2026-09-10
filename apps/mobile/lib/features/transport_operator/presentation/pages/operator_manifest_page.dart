import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/transport_operator_bloc.dart';
import '../bloc/transport_operator_event.dart';
import '../bloc/transport_operator_state.dart';
import '../../../../theme/app_theme.dart';

class OperatorManifestPage extends StatefulWidget {
  final String tripId;
  final String routeName;

  const OperatorManifestPage({super.key, required this.tripId, required this.routeName});

  @override
  State<OperatorManifestPage> createState() => _OperatorManifestPageState();
}

class _OperatorManifestPageState extends State<OperatorManifestPage> {
  @override
  void initState() {
    super.initState();
    context.read<TransportOperatorBloc>().add(LoadTripManifest(widget.tripId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Trip Manifest', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.navyColor, fontSize: 18)),
            Text(widget.routeName, style: const TextStyle(color: Colors.black38, fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.navyColor),
      ),
      body: BlocBuilder<TransportOperatorBloc, TransportOperatorState>(
        builder: (context, state) {
          if (state.isLoading && state.manifest.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          final manifest = state.manifest;
          if (manifest.isEmpty) {
            return const Center(child: Text('No students assigned to this route'));
          }

          return RefreshIndicator(
            onRefresh: () async {
              context.read<TransportOperatorBloc>().add(LoadTripManifest(widget.tripId));
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: manifest.length,
              itemBuilder: (context, index) {
                final item = manifest[index];
                final student = item['student'];
                final stop = item['stop'];

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: CircleAvatar(
                      backgroundColor: AppTheme.backgroundColor,
                      child: Text(student['firstName'][0], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
                    ),
                    title: Text('${student['firstName']} ${student['lastName']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text('Stop: ${stop['name']}', style: const TextStyle(fontSize: 11, color: Colors.black54)),
                        Text('ID: ${student['admissionNumber']}', style: const TextStyle(fontSize: 10, color: Colors.black26, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    trailing: _buildBoardingControl(context, item),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildBoardingControl(BuildContext context, Map<String, dynamic> item) {
    final status = item['boardingStatus'];
    final isBoarded = status == 'BOARDED';

    return GestureDetector(
      onTap: () {
        if (!isBoarded) {
          context.read<TransportOperatorBloc>().add(RecordStudentBoarding(
            tripId: widget.tripId,
            studentId: item['studentId'],
            stopId: item['stopId'],
            lat: 0, lng: 0, // In real app, get current GPS
          ));
        } else {
          context.read<TransportOperatorBloc>().add(RecordStudentDeboarding(
            tripId: widget.tripId,
            studentId: item['studentId'],
            stopId: item['stopId'],
            lat: 0, lng: 0,
          ));
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isBoarded ? Colors.green : Colors.grey[200],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(isBoarded ? Icons.check_circle_rounded : Icons.radio_button_unchecked, color: isBoarded ? Colors.white : Colors.black26, size: 16),
            const SizedBox(width: 8),
            Text(isBoarded ? 'BOARDED' : 'MARK', style: TextStyle(color: isBoarded ? Colors.white : Colors.black45, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
