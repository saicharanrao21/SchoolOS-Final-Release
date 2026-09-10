import 'package:equatable/equatable.dart';
import '../../data/models/child_model.dart';
import '../../data/models/dashboard_model.dart';

class ParentState extends Equatable {
  final List<ChildModel> children;
  final String? selectedChildId;
  final bool isLoading;
  final String? error;
  
  final DashboardModel? dashboard;
  final Map<String, dynamic>? attendance;
  final Map<String, dynamic>? academics;
  final List<dynamic>? exams;
  final Map<String, dynamic>? finance;
  final Map<String, dynamic>? transport;

  const ParentState({
    this.children = const [],
    this.selectedChildId,
    this.isLoading = false,
    this.error,
    this.dashboard,
    this.attendance,
    this.academics,
    this.exams,
    this.finance,
    this.transport,
  });

  ParentState copyWith({
    List<ChildModel>? children,
    String? selectedChildId,
    bool? isLoading,
    String? error,
    DashboardModel? dashboard,
    Map<String, dynamic>? attendance,
    Map<String, dynamic>? academics,
    List<dynamic>? exams,
    Map<String, dynamic>? finance,
    Map<String, dynamic>? transport,
  }) {
    return ParentState(
      children: children ?? this.children,
      selectedChildId: selectedChildId ?? this.selectedChildId,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      dashboard: dashboard ?? this.dashboard,
      attendance: attendance ?? this.attendance,
      academics: academics ?? this.academics,
      exams: exams ?? this.exams,
      finance: finance ?? this.finance,
      transport: transport ?? this.transport,
    );
  }

  @override
  List<Object?> get props => [
    children, 
    selectedChildId, 
    isLoading, 
    error, 
    dashboard, 
    attendance, 
    academics, 
    exams, 
    finance, 
    transport
  ];
}
