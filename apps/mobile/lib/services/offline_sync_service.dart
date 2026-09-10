import 'dart:async';
import '../networking/api_client.dart';

enum SyncState { online, offline, syncing, synced, syncFailed, conflict }

class PendingMutation {
  final String clientMutationId;
  final String entityType;
  final String? entityId;
  final String action;
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  int retryCount;

  PendingMutation({
    required this.clientMutationId,
    required this.entityType,
    this.entityId,
    required this.action,
    required this.payload,
    required this.createdAt,
    this.retryCount = 0,
  });

  Map<String, dynamic> toJson() => {
        'clientMutationId': clientMutationId,
        'entityType': entityType,
        'entityId': entityId,
        'action': action,
        'payload': payload,
        'createdAt': createdAt.toIso8601String(),
        'retryCount': retryCount,
      };

  factory PendingMutation.fromJson(Map<String, dynamic> json) => PendingMutation(
        clientMutationId: json['clientMutationId'],
        entityType: json['entityType'],
        entityId: json['entityId'],
        action: json['action'],
        payload: Map<String, dynamic>.from(json['payload']),
        createdAt: DateTime.parse(json['createdAt']),
        retryCount: json['retryCount'] ?? 0,
      );
}

class OfflineSyncService {
  final ApiClient apiClient;
  final List<PendingMutation> _mutationQueue = [];
  SyncState _currentState = SyncState.online;
  final _stateController = StreamController<SyncState>.broadcast();

  OfflineSyncService({required this.apiClient});

  Stream<SyncState> get syncStateStream => _stateController.stream;
  SyncState get currentState => _currentState;

  void enqueueMutation({
    required String entityType,
    String? entityId,
    required String action,
    required Map<String, dynamic> payload,
  }) {
    final mutation = PendingMutation(
      clientMutationId: 'mut_${DateTime.now().millisecondsSinceEpoch}_${_mutationQueue.length}',
      entityType: entityType,
      entityId: entityId,
      action: action,
      payload: payload,
      createdAt: DateTime.now(),
    );

    _mutationQueue.add(mutation);
    if (_currentState == SyncState.online) {
      triggerSync();
    }
  }

  Future<void> triggerSync() async {
    if (_mutationQueue.isEmpty) {
      _updateState(SyncState.synced);
      return;
    }

    _updateState(SyncState.syncing);

    final List<PendingMutation> toRemove = [];

    for (final mutation in List<PendingMutation>.from(_mutationQueue)) {
      try {
        final response = await apiClient.post('/sync/push', mutation.toJson());

        if (response.statusCode == 200 || response.statusCode == 201) {
          toRemove.add(mutation);
        } else if (response.statusCode == 409) {
          _updateState(SyncState.conflict);
          break;
        } else {
          mutation.retryCount++;
          if (mutation.retryCount >= 5) {
            toRemove.add(mutation); // Drop or move to dead-letter after 5 retries
          }
        }
      } catch (e) {
        mutation.retryCount++;
        _updateState(SyncState.offline);
        break;
      }
    }

    for (final m in toRemove) {
      _mutationQueue.remove(m);
    }

    if (_mutationQueue.isEmpty) {
      _updateState(SyncState.synced);
    } else if (_currentState != SyncState.offline) {
      _updateState(SyncState.syncFailed);
    }
  }

  void _updateState(SyncState state) {
    _currentState = state;
    _stateController.add(state);
  }

  void dispose() {
    _stateController.close();
  }
}
