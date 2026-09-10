import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/transport_operator_repository.dart';
import 'transport_operator_event.dart';
import 'transport_operator_state.dart';

class TransportOperatorBloc extends Bloc<TransportOperatorEvent, TransportOperatorState> {
  final TransportOperatorRepository repository;

  TransportOperatorBloc({required this.repository}) : super(const TransportOperatorState()) {
    on<LoadOperatorDashboard>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        final dashboard = await repository.getDashboard();
        emit(state.copyWith(isLoading: false, dashboard: dashboard));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<StartOperatorTrip>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        await repository.startTrip(event.tripId);
        final dashboard = await repository.getDashboard();
        emit(state.copyWith(isLoading: false, dashboard: dashboard, isTracking: true));
        add(LoadTripManifest(event.tripId));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<LoadTripManifest>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        final manifest = await repository.getManifest(event.tripId);
        emit(state.copyWith(isLoading: false, manifest: manifest));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<UpdateOperatorLocation>((event, emit) async {
      try {
        await repository.updateLocation(event.tripId, event.lat, event.lng, speed: event.speed, heading: event.heading);
      } catch (e) {
        // Silently fail location updates in UI but maybe log
      }
    });

    on<RecordStudentBoarding>((event, emit) async {
      try {
        await repository.recordBoarding(event.tripId, event.studentId, event.stopId, event.lat, event.lng);
      } catch (e) {
        emit(state.copyWith(error: 'Failed to record boarding: ${e.toString()}'));
      }
    });

    on<RecordStudentDeboarding>((event, emit) async {
      try {
        await repository.recordDeboarding(event.tripId, event.studentId, event.stopId, event.lat, event.lng);
      } catch (e) {
        emit(state.copyWith(error: 'Failed to record deboarding: ${e.toString()}'));
      }
    });

    on<TriggerOperatorSos>((event, emit) async {
      try {
        await repository.triggerSos(event.tripId, event.lat, event.lng);
        emit(state.copyWith(error: 'SOS Triggered Successfully'));
      } catch (e) {
        emit(state.copyWith(error: 'Failed to trigger SOS: ${e.toString()}'));
      }
    });

    on<RecordVehicleInspection>((event, emit) async {
      try {
        await repository.recordInspection(event.tripId, event.checklist, event.passed, event.notes);
      } catch (e) {
        emit(state.copyWith(error: 'Failed to record inspection: ${e.toString()}'));
      }
    });

    on<CompleteOperatorTrip>((event, emit) async {
      emit(state.copyWith(isLoading: true, error: null));
      try {
        await repository.completeTrip(event.tripId);
        final dashboard = await repository.getDashboard();
        emit(state.copyWith(isLoading: false, dashboard: dashboard, isTracking: false));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });
  }
}
