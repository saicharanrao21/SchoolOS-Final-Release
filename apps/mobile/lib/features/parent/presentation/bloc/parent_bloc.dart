import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/parent_repository.dart';
import 'parent_event.dart';
import 'parent_state.dart';

class ParentBloc extends Bloc<ParentEvent, ParentState> {
  final ParentRepository repository;

  ParentBloc({required this.repository}) : super(const ParentState()) {
    on<LoadChildren>((event, emit) async {
      emit(state.copyWith(isLoading: true));
      try {
        final children = await repository.getChildren();
        emit(state.copyWith(
          isLoading: false, 
          children: children,
          selectedChildId: children.isNotEmpty ? children.first.id : null,
        ));
        if (children.isNotEmpty) {
           add(LoadDashboard());
        }
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<SelectChild>((event, emit) {
      emit(state.copyWith(selectedChildId: event.studentId));
      add(LoadDashboard());
    });

    on<LoadDashboard>((event, emit) async {
      if (state.selectedChildId == null) return;
      emit(state.copyWith(isLoading: true));
      try {
        final dashboard = await repository.getChildDashboard(state.selectedChildId!);
        emit(state.copyWith(isLoading: false, dashboard: dashboard));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadAttendance>((event, emit) async {
      if (state.selectedChildId == null) return;
      emit(state.copyWith(isLoading: true));
      try {
        final attendance = await repository.getAttendance(state.selectedChildId!, event.academicYearId);
        emit(state.copyWith(isLoading: false, attendance: attendance));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadAcademics>((event, emit) async {
      if (state.selectedChildId == null) return;
      emit(state.copyWith(isLoading: true));
      try {
        final academics = await repository.getAcademics(state.selectedChildId!);
        emit(state.copyWith(isLoading: false, academics: academics));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadExams>((event, emit) async {
      if (state.selectedChildId == null) return;
      emit(state.copyWith(isLoading: true));
      try {
        final exams = await repository.getExams(state.selectedChildId!);
        emit(state.copyWith(isLoading: false, exams: exams));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadFinance>((event, emit) async {
      if (state.selectedChildId == null) return;
      emit(state.copyWith(isLoading: true));
      try {
        final finance = await repository.getFinance(state.selectedChildId!);
        emit(state.copyWith(isLoading: false, finance: finance));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadTransport>((event, emit) async {
      if (state.selectedChildId == null) return;
      emit(state.copyWith(isLoading: true));
      try {
        final transport = await repository.getTransport(state.selectedChildId!);
        emit(state.copyWith(isLoading: false, transport: transport));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });
  }
}
