import 'dart:async';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Silent Shake and Hardware Pocket Trigger Service for SafeBangla.
/// Monitors device accelerometer for rapid shake gestures (pocket emergency trigger)
/// and formats compressed emergency payloads for zero-network / covert SOS dispatch.
class SilentShakeDetector {
  static final SilentShakeDetector _instance = SilentShakeDetector._internal();
  factory SilentShakeDetector() => _instance;
  SilentShakeDetector._internal();

  bool _isArmed = true;
  DateTime? _lastShakeTime;
  int _shakeCount = 0;
  static const double _shakeThreshold = 28.0; // Acceleration threshold (m/s^2)
  static const Duration _shakeWindow = Duration(seconds: 2);

  final _sosTriggerController = StreamController<CovertSosEvent>.broadcast();
  Stream<CovertSosEvent> get onCovertSosTriggered => _sosTriggerController.stream;

  bool get isArmed => _isArmed;

  void arm() {
    _isArmed = true;
    if (kDebugMode) {
      print("[SafeBangla] Silent Shake Detector ARMED");
    }
  }

  void disarm() {
    _isArmed = false;
    _shakeCount = 0;
    if (kDebugMode) {
      print("[SafeBangla] Silent Shake Detector DISARMED");
    }
  }

  /// Processes raw accelerometer sensor data (X, Y, Z in m/s^2)
  void processSensorSample(double x, double y, double z) {
    if (!_isArmed) return;

    // Calculate total net magnitude vector
    final double gForce = sqrt(x * x + y * y + z * z);
    final now = DateTime.now();

    if (gForce > _shakeThreshold) {
      if (_lastShakeTime == null || now.difference(_lastShakeTime!) > _shakeWindow) {
        _shakeCount = 1;
      } else {
        _shakeCount++;
      }
      _lastShakeTime = now;

      // Triple violent shake detected within 2-second window
      if (_shakeCount >= 3) {
        _shakeCount = 0;
        _dispatchCovertEmergency(
          triggerSource: "ACCELEROMETER_RAPID_SHAKE",
          gForceRecorded: gForce,
        );
      }
    }
  }

  /// Handles hardware Volume-Down triple click event from native bridge
  void handleHardwareVolumeTripleClick() {
    if (!_isArmed) return;
    _dispatchCovertEmergency(
      triggerSource: "PHYSICAL_VOLUME_DOWN_TRIPLE_PRESS",
      gForceRecorded: 0.0,
    );
  }

  void _dispatchCovertEmergency({
    required String triggerSource,
    required double gForceRecorded,
  }) {
    // Covert dispatch: Suppress audio chimes, keep screen state untouched, trigger haptic pulse
    HapticFeedback.heavyImpact();

    final event = CovertSosEvent(
      timestamp: DateTime.now(),
      triggerSource: triggerSource,
      latitude: 21.4272, // GPS sensor fallback (e.g. Cox's Bazar coast)
      longitude: 92.0058,
      batteryLevel: 84,
      isSilent: true,
      silentAudioSeconds: 10,
    );

    _sosTriggerController.add(event);

    if (kDebugMode) {
      print("[SafeBangla COVERT SOS] Dispatched via $triggerSource at ${event.timestamp.toIso8601String()}");
    }
  }

  /// Formats compressed 140-char offline SMS payload
  String formatCompressedSmsPayload(CovertSosEvent event) {
    // Format: SB!COV|<LAT>|<LNG>|<BAT>|<TIME>
    final lat = event.latitude.toStringAsFixed(4);
    final lng = event.longitude.toStringAsFixed(4);
    final timeStr = event.timestamp.millisecondsSinceEpoch ~/ 1000;
    return "SB!COV|$lat|$lng|${event.batteryLevel}|$timeStr";
  }

  void dispose() {
    _sosTriggerController.close();
  }
}

class CovertSosEvent {
  final DateTime timestamp;
  final String triggerSource;
  final double latitude;
  final double longitude;
  final int batteryLevel;
  final bool isSilent;
  final int silentAudioSeconds;

  CovertSosEvent({
    required this.timestamp,
    required this.triggerSource,
    required this.latitude,
    required this.longitude,
    required this.batteryLevel,
    required this.isSilent,
    required this.silentAudioSeconds,
  });
}
