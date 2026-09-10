import 'package:equatable/equatable.dart';

class TransportOperatorState extends Equatable {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? dashboard;
  final List<dynamic> manifest;
  final bool isTracking;

  const TransportOperatorState({
    this.isLoading = false,
    this.error,
    this.dashboard,
    this.manifest = const [],
    this.isTracking = false,
  });

  TransportOperatorState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? dashboard,
    List<dynamic>? manifest,
    bool? isTracking,
  }) {
    return TransportOperatorState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      dashboard: dashboard ?? this.dashboard,
      manifest: manifest ?? this.manifest,
      isTracking: isTracking ?? this.isTracking,
    );
  }

  @override
  List<Object?> get props => [isLoading, error, dashboard, manifest, isTracking];
}
