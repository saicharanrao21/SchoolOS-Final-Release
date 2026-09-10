import 'package:equatable/equatable.dart';
import '../../data/models/teacher_dashboard_model.dart';

class TeacherState extends Equatable {
  final bool isLoading;
  final String? error;
  final TeacherDashboardModel? dashboard;
  final List<dynamic> classes;
  final List<dynamic> students;
  final List<dynamic> timetable;

  const TeacherState({
    this.isLoading = false,
    this.error,
    this.dashboard,
    this.classes = const [],
    this.students = const [],
    this.timetable = const [],
  });

  TeacherState copyWith({
    bool? isLoading,
    String? error,
    TeacherDashboardModel? dashboard,
    List<dynamic>? classes,
    List<dynamic>? students,
    List<dynamic>? timetable,
  }) {
    return TeacherState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      dashboard: dashboard ?? this.dashboard,
      classes: classes ?? this.classes,
      students: students ?? this.students,
      timetable: timetable ?? this.timetable,
    );
  }

  @override
  List<Object?> get props => [isLoading, error, dashboard, classes, students, timetable];
}
