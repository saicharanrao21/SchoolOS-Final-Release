import 'package:equatable/equatable.dart';

abstract class TeacherEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadTeacherDashboard extends TeacherEvent {}
class LoadTeacherClasses extends TeacherEvent {}
class LoadClassStudents extends TeacherEvent {
  final String classId;
  final String sectionId;
  LoadClassStudents(this.classId, this.sectionId);
}
class LoadTeacherTimetable extends TeacherEvent {}
