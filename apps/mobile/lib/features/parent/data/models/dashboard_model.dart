import 'child_model.dart';

class DashboardModel {
  final ChildModel student;
  final Map<String, dynamic>? attendanceToday;
  final Map<String, dynamic>? feeSummary;
  final List<dynamic> upcomingExams;
  final int pendingHomeworkCount;
  final Map<String, dynamic>? transport;

  DashboardModel({
    required this.student,
    this.attendanceToday,
    this.feeSummary,
    required this.upcomingExams,
    required this.pendingHomeworkCount,
    this.transport,
  });

  factory DashboardModel.fromJson(Map<String, dynamic> json) {
    return DashboardModel(
      student: ChildModel.fromJson(json['student']),
      attendanceToday: json['attendanceToday'],
      feeSummary: json['feeSummary'],
      upcomingExams: json['upcomingExams'] ?? [],
      pendingHomeworkCount: json['pendingHomeworkCount'] ?? 0,
      transport: json['transport'],
    );
  }
}
