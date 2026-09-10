import 'dart:convert';
import '../../../../networking/api_client.dart';
import '../models/child_model.dart';
import '../models/dashboard_model.dart';

class ParentRepository {
  final ApiClient apiClient;

  ParentRepository({required this.apiClient});

  Future<List<ChildModel>> getChildren() async {
    final response = await apiClient.get('/parent/children');
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => ChildModel.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load children');
    }
  }

  Future<DashboardModel> getChildDashboard(String studentId) async {
    final response = await apiClient.get('/parent/children/$studentId/dashboard');
    if (response.statusCode == 200) {
      return DashboardModel.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load dashboard');
    }
  }

  Future<Map<String, dynamic>> getAttendance(String studentId, String academicYearId) async {
    final response = await apiClient.get('/parent/children/$studentId/attendance?academicYearId=$academicYearId');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load attendance');
    }
  }

  Future<Map<String, dynamic>> getAcademics(String studentId) async {
    final response = await apiClient.get('/parent/children/$studentId/academics');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load academics');
    }
  }

  Future<List<dynamic>> getExams(String studentId) async {
    final response = await apiClient.get('/parent/children/$studentId/exams');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load exams');
    }
  }

  Future<Map<String, dynamic>> getFinance(String studentId) async {
    final response = await apiClient.get('/parent/children/$studentId/finance');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load finance');
    }
  }

  Future<Map<String, dynamic>> getTransport(String studentId) async {
    final response = await apiClient.get('/parent/children/$studentId/transport');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load transport');
    }
  }
}
