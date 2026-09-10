import 'package:equatable/equatable.dart';

abstract class TransportOperatorEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadOperatorDashboard extends TransportOperatorEvent {}

class LoadTripManifest extends TransportOperatorEvent {
  final String tripId;
  LoadTripManifest(this.tripId);
  @override
  List<Object?> get props => [tripId];
}

class StartOperatorTrip extends TransportOperatorEvent {
  final String tripId;
  StartOperatorTrip(this.tripId);
  @override
  List<Object?> get props => [tripId];
}

class UpdateOperatorLocation extends TransportOperatorEvent {
  final String tripId;
  final double lat;
  final double lng;
  final double? speed;
  final double? heading;

  UpdateOperatorLocation({required this.tripId, required this.lat, required this.lng, this.speed, this.heading});

  @override
  List<Object?> get props => [tripId, lat, lng, speed, heading];
}

class RecordStudentBoarding extends TransportOperatorEvent {
  final String tripId;
  final String studentId;
  final String stopId;
  final double? lat;
  final double? lng;

  RecordStudentBoarding({required this.tripId, required this.studentId, required this.stopId, this.lat, this.lng});

  @override
  List<Object?> get props => [tripId, studentId, stopId, lat, lng];
}

class RecordStudentDeboarding extends TransportOperatorEvent {
  final String tripId;
  final String studentId;
  final String stopId;
  final double? lat;
  final double? lng;

  RecordStudentDeboarding({required this.tripId, required this.studentId, required this.stopId, this.lat, this.lng});

  @override
  List<Object?> get props => [tripId, studentId, stopId, lat, lng];
}

class TriggerOperatorSos extends TransportOperatorEvent {
  final String tripId;
  final double? lat;
  final double? lng;

  TriggerOperatorSos({required this.tripId, this.lat, this.lng});

  @override
  List<Object?> get props => [tripId, lat, lng];
}

class RecordVehicleInspection extends TransportOperatorEvent {
  final String tripId;
  final Map<String, bool> checklist;
  final bool passed;
  final String? notes;

  RecordVehicleInspection({required this.tripId, required this.checklist, required this.passed, this.notes});

  @override
  List<Object?> get props => [tripId, checklist, passed, notes];
}

class CompleteOperatorTrip extends TransportOperatorEvent {
  final String tripId;
  CompleteOperatorTrip(this.tripId);
  @override
  List<Object?> get props => [tripId];
}
