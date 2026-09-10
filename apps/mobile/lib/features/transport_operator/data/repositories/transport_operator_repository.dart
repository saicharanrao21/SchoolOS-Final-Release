import 'dart:convert';
import '../../../../networking/api_client.dart';

class TransportOperatorRepository {
  final ApiClient apiClient;

  TransportOperatorRepository({required this.apiClient});

  Future<Map<String, dynamic>> getDashboard() async {
    final response = await apiClient.get('/transport/operator/dashboard');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load operator dashboard');
    }
  }

  Future<Map<String, dynamic>> startTrip(String tripId) async {
    final response = await apiClient.post('/transport/operator/trips/$tripId/start', {});
    if (response.statusCode == 201 || response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to start trip');
    }
  }

  Future<List<dynamic>> getManifest(String tripId) async {
    final response = await apiClient.get('/transport/operator/trips/$tripId/manifest');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load manifest');
    }
  }

  Future<void> updateLocation(String tripId, double lat, double lng, {double? speed, double? heading}) async {
    final response = await apiClient.post('/transport/operator/trips/$tripId/location', {
      'latitude': lat,
      'longitude': lng,
      'speed': speed,
      'heading': heading,
    });
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to update location');
    }
  }

  Future<void> recordBoarding(String tripId, String studentId, String stopId, double? lat, double? lng) async {
    final response = await apiClient.post('/transport/operator/trips/$tripId/boarding', {
      'studentId': studentId,
      'stopId': stopId,
      'latitude': lat,
      'longitude': lng,
    });
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to record boarding');
    }
  }

  Future<void> recordDeboarding(String tripId, String studentId, String stopId, double? lat, double? lng) async {
    final response = await apiClient.post('/transport/operator/trips/$tripId/deboarding', {
      'studentId': studentId,
      'stopId': stopId,
      'latitude': lat,
      'longitude': lng,
    });
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to record deboarding');
    }
  }

  Future<void> triggerSos(String tripId, double? lat, double? lng) async {
    final response = await apiClient.post('/transport/operator/trips/$tripId/sos', {
      'latitude': lat,
      'longitude': lng,
    });
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to trigger SOS');
    }
  }

  Future<void> recordInspection(String tripId, Map<String, bool> checklist, bool passed, String? notes) async {
    final response = await apiClient.post('/transport/operator/trips/$tripId/inspection', {
      'checklist': checklist,
      'passed': passed,
      'notes': notes,
    });
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to record inspection');
    }
  }

  Future<void> completeTrip(String tripId) async {
    final response = await apiClient.post('/transport/operator/trips/$tripId/complete', {});
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to complete trip');
    }
  }
}
