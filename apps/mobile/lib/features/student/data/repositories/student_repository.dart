import 'dart:convert';
import '../../../../networking/api_client.dart';
import '../models/student_dashboard_model.dart';

class StudentRepository {
  final ApiClient apiClient;

  StudentRepository({required this.apiClient});

  Future<StudentDashboardModel> getDashboard() async {
    final response = await apiClient.get('/student/portal/dashboard');
    if (response.statusCode == 200) {
      return StudentDashboardModel.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load student dashboard');
    }
  }

  Future<List<dynamic>> getTimetable() async {
    final response = await apiClient.get('/student/portal/timetable');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load timetable');
    }
  }

  Future<List<dynamic>> getHomework() async {
    final response = await apiClient.get('/student/portal/homework');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load homework');
    }
  }

  Future<List<dynamic>> getResults() async {
    final response = await apiClient.get('/student/portal/results');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load results');
    }
  }

  Future<List<dynamic>> getAttendance(String? academicYearId) async {
    final path = academicYearId != null 
      ? '/student/portal/attendance?academicYearId=$academicYearId'
      : '/student/portal/attendance';
    final response = await apiClient.get(path);
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load attendance');
    }
  }
}
