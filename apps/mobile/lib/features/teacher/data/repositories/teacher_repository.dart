import 'dart:convert';
import '../../../../networking/api_client.dart';
import '../models/teacher_dashboard_model.dart';

class TeacherRepository {
  final ApiClient apiClient;

  TeacherRepository({required this.apiClient});

  Future<TeacherDashboardModel> getDashboard() async {
    final response = await apiClient.get('/teacher/dashboard');
    if (response.statusCode == 200) {
      return TeacherDashboardModel.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load teacher dashboard');
    }
  }

  Future<List<dynamic>> getClasses() async {
    final response = await apiClient.get('/teacher/classes');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load classes');
    }
  }

  Future<List<dynamic>> getClassStudents(String classId, String sectionId) async {
    final response = await apiClient.get('/teacher/classes/$classId/sections/$sectionId/students');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load students');
    }
  }

  Future<List<dynamic>> getTimetable() async {
    final response = await apiClient.get('/teacher/timetable');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load timetable');
    }
  }
}
