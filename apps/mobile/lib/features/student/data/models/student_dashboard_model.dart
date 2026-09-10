class StudentDashboardModel {
  final Map<String, dynamic> student;
  final List<dynamic> timetableToday;
  final List<dynamic> pendingHomework;
  final List<dynamic> upcomingExams;
  final List<dynamic> attendanceStats;

  StudentDashboardModel({
    required this.student,
    required this.timetableToday,
    required this.pendingHomework,
    required this.upcomingExams,
    required this.attendanceStats,
  });

  factory StudentDashboardModel.fromJson(Map<String, dynamic> json) {
    return StudentDashboardModel(
      student: json['student'],
      timetableToday: json['timetableToday'] ?? [],
      pendingHomework: json['pendingHomework'] ?? [],
      upcomingExams: json['upcomingExams'] ?? [],
      attendanceStats: json['attendanceStats'] ?? [],
    );
  }
}
