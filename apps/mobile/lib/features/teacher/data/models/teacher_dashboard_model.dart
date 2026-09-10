class TeacherDashboardModel {
  final Map<String, dynamic> profile;
  final List<dynamic> timetableToday;
  final int pendingReviewsCount;
  final List<dynamic> upcomingExams;

  TeacherDashboardModel({
    required this.profile,
    required this.timetableToday,
    required this.pendingReviewsCount,
    required this.upcomingExams,
  });

  factory TeacherDashboardModel.fromJson(Map<String, dynamic> json) {
    return TeacherDashboardModel(
      profile: json['profile'],
      timetableToday: json['timetableToday'] ?? [],
      pendingReviewsCount: json['pendingReviewsCount'] ?? 0,
      upcomingExams: json['upcomingExams'] ?? [],
    );
  }
}
