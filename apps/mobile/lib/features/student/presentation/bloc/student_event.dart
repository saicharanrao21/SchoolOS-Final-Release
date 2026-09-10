import 'package:equatable/equatable.dart';

abstract class StudentEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadStudentDashboard extends StudentEvent {}
class LoadStudentTimetable extends StudentEvent {}
class LoadStudentHomework extends StudentEvent {}
class LoadStudentResults extends StudentEvent {}
class LoadStudentAttendance extends StudentEvent {
  final String? academicYearId;
  LoadStudentAttendance({this.academicYearId});
  @override
  List<Object?> get props => [academicYearId];
}
