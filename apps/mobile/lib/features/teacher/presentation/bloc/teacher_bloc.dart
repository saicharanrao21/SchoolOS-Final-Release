import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/teacher_repository.dart';
import 'teacher_event.dart';
import 'teacher_state.dart';

class TeacherBloc extends Bloc<TeacherEvent, TeacherState> {
  final TeacherRepository repository;

  TeacherBloc({required this.repository}) : super(const TeacherState()) {
    on<LoadTeacherDashboard>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        final dashboard = await repository.getDashboard();
        emit(state.copyWith(isLoading: false, dashboard: dashboard));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadTeacherClasses>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        final classes = await repository.getClasses();
        emit(state.copyWith(isLoading: false, classes: classes));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadClassStudents>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        final students = await repository.getClassStudents(event.classId, event.sectionId);
        emit(state.copyWith(isLoading: false, students: students));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadTeacherTimetable>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        final timetable = await repository.getTimetable();
        emit(state.copyWith(isLoading: false, timetable: timetable));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });
  }
}
