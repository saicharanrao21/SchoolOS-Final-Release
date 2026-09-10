import 'package:equatable/equatable.dart';
import '../../data/models/student_dashboard_model.dart';

class StudentState extends Equatable {
  final bool isLoading;
  final String? error;
  final StudentDashboardModel? dashboard;
  final List<dynamic> timetable;
  final List<dynamic> homework;
  final List<dynamic> results;
  final List<dynamic> attendance;

  const StudentState({
    this.isLoading = false,
    this.error,
    this.dashboard,
    this.timetable = const [],
    this.homework = const [],
    this.results = const [],
    this.attendance = const [],
  });

  StudentState copyWith({
    bool? isLoading,
    String? error,
    StudentDashboardModel? dashboard,
    List<dynamic>? timetable,
    List<dynamic>? homework,
    List<dynamic>? results,
    List<dynamic>? attendance,
  }) {
    return StudentState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      dashboard: dashboard ?? this.dashboard,
      timetable: timetable ?? this.timetable,
      homework: homework ?? this.homework,
      results: results ?? this.results,
      attendance: attendance ?? this.attendance,
    );
  }

  @override
  List<Object?> get props => [
    isLoading, 
    error, 
    dashboard, 
    timetable, 
    homework, 
    results, 
    attendance
  ];
}
