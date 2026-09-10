import 'package:equatable/equatable.dart';

abstract class ParentEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadChildren extends ParentEvent {}

class SelectChild extends ParentEvent {
  final String studentId;
  SelectChild(this.studentId);
  @override
  List<Object?> get props => [studentId];
}

class LoadDashboard extends ParentEvent {}
class LoadAttendance extends ParentEvent {
  final String academicYearId;
  LoadAttendance(this.academicYearId);
}
class LoadAcademics extends ParentEvent {}
class LoadExams extends ParentEvent {}
class LoadFinance extends ParentEvent {}
class LoadTransport extends ParentEvent {}
