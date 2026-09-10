import 'package:flutter/material.dart';
import 'package:schoolos_mobile/theme/app_theme.dart';
import 'package:schoolos_mobile/features/library/presentation/pages/library_page.dart';
import 'package:schoolos_mobile/features/hostel/presentation/pages/hostel_page.dart';
import 'package:schoolos_mobile/features/events/presentation/pages/events_page.dart';
import 'package:schoolos_mobile/features/ptm/presentation/pages/ptm_page.dart';
import 'package:schoolos_mobile/features/shared/pages/documents/document_list_page.dart';
import 'package:schoolos_mobile/features/shared/pages/certificates/certificate_list_page.dart';

class CampusLifePage extends StatelessWidget {
  const CampusLifePage({super.key});

  @override
  Widget build(BuildContext context) {
    final modules = [
      {'label': 'Library', 'icon': Icons.local_library_rounded, 'color': Colors.blue, 'page': const LibraryPage()},
      {'label': 'Hostel', 'icon': Icons.hotel_rounded, 'color': Colors.indigo, 'page': const HostelPage()},
      {'label': 'Events', 'icon': Icons.event_available_rounded, 'color': Colors.purple, 'page': const EventsPage()},
      {'label': 'PTM', 'icon': Icons.people_alt_rounded, 'color': Colors.teal, 'page': const PtmPage()},
      {'label': 'Documents', 'icon': Icons.file_copy_rounded, 'color': Colors.orange, 'page': const DocumentListPage()},
      {'label': 'Certificates', 'icon': Icons.verified_rounded, 'color': Colors.blue, 'page': const CertificateListPage()},
      {'label': 'Incidents', 'icon': Icons.report_problem_rounded, 'color': Colors.red, 'page': const Center(child: Text('Incident Reporting'))},
    ];

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Campus Life', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.navyColor)),
            const SizedBox(height: 8),
            const Text('Explore and manage institutional facilities', style: TextStyle(fontSize: 13, color: Colors.black38, fontWeight: FontWeight.w500)),
            const SizedBox(height: 32),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.1,
                ),
                itemCount: modules.length,
                itemBuilder: (context, i) {
                  final m = modules[i];
                  return Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: AppTheme.borderColor)),
                    child: InkWell(
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => Scaffold(
                          appBar: AppBar(backgroundColor: Colors.white, elevation: 0, iconTheme: const IconThemeData(color: AppTheme.navyColor)),
                          body: m['page'] as Widget,
                        )));
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(color: (m['color'] as Color).withOpacity(0.1), shape: BoxShape.circle),
                            child: Icon(m['icon'] as IconData, color: m['color'] as Color, size: 28),
                          ),
                          const SizedBox(height: 12),
                          Text(m['label'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.navyColor)),
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
