import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/student_repository.dart';
import 'student_event.dart';
import 'student_state.dart';

class StudentBloc extends Bloc<StudentEvent, StudentState> {
  final StudentRepository repository;

  StudentBloc({required this.repository}) : super(const StudentState()) {
    on<LoadStudentDashboard>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        final dashboard = await repository.getDashboard();
        emit(state.copyWith(isLoading: false, dashboard: dashboard));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadStudentTimetable>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        final timetable = await repository.getTimetable();
        emit(state.copyWith(isLoading: false, timetable: timetable));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadStudentHomework>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        final homework = await repository.getHomework();
        emit(state.copyWith(isLoading: false, homework: homework));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadStudentResults>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        final results = await repository.getResults();
        emit(state.copyWith(isLoading: false, results: results));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadStudentAttendance>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        final attendance = await repository.getAttendance(event.academicYearId);
        emit(state.copyWith(isLoading: false, attendance: attendance));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });
  }
}
