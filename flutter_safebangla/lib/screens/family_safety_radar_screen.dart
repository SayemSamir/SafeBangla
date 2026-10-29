import 'dart:math';
import 'package:flutter/material.dart';

enum SafetyStatus { safe, inDanger, unknown }

class FamilyMemberModel {
  final String id;
  final String name;
  final String relationship;
  final double distanceKm;
  final int batteryPercent;
  final String location;
  final String lastCheckIn;
  SafetyStatus status;

  FamilyMemberModel({
    required this.id,
    required this.name,
    required this.relationship,
    required this.distanceKm,
    required this.batteryPercent,
    required this.location,
    required this.lastCheckIn,
    this.status = SafetyStatus.safe,
  });
}

class FamilySafetyRadarScreen extends StatefulWidget {
  const FamilySafetyRadarScreen({super.key});

  @override
  State<FamilySafetyRadarScreen> createState() => _FamilySafetyRadarScreenState();
}

class _FamilySafetyRadarScreenState extends State<FamilySafetyRadarScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _radarController;

  final List<FamilyMemberModel> _familyMembers = [
    FamilyMemberModel(
      id: "f1",
      name: "Tariqul Islam (Abba)",
      relationship: "Father",
      distanceKm: 2.4,
      batteryPercent: 78,
      location: "Chakaria, Cox's Bazar",
      lastCheckIn: "4m ago",
      status: SafetyStatus.safe,
    ),
    FamilyMemberModel(
      id: "f2",
      name: "Nasreen Akter (Amma)",
      relationship: "Mother",
      distanceKm: 2.4,
      batteryPercent: 62,
      location: "Chakaria, Cox's Bazar",
      lastCheckIn: "4m ago",
      status: SafetyStatus.safe,
    ),
    FamilyMemberModel(
      id: "f3",
      name: "Zubair Rahman (Bhai)",
      relationship: "Brother",
      distanceKm: 6.8,
      batteryPercent: 19,
      location: "Pekua Coastal Embankment",
      lastCheckIn: "1m ago",
      status: SafetyStatus.inDanger,
    ),
    FamilyMemberModel(
      id: "f4",
      name: "Amina Begum (Sister)",
      relationship: "Sister",
      distanceKm: 11.2,
      batteryPercent: 88,
      location: "Kutubdia Island High School",
      lastCheckIn: "12m ago",
      status: SafetyStatus.safe,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _radarController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _radarController.dispose();
    super.dispose();
  }

  void _broadcastIamSafe() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF10B981),
        content: Row(
          children: const [
            Icon(Icons.check_circle, color: Colors.white),
            SizedBox(width: 8),
            Expanded(
              child: Text(
                "1-Tap Safety Beacon Broadcasted to all 4 Family Members!",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _toggleMemberSafety(FamilyMemberModel member) {
    setState(() {
      member.status = member.status == SafetyStatus.safe
          ? SafetyStatus.inDanger
          : SafetyStatus.safe;
    });
  }

  @override
  Widget build(BuildContext context) {
    final dangerCount = _familyMembers.where((m) => m.status == SafetyStatus.inDanger).length;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "SafeBangla Family Circle",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: Colors.white,
              ),
            ),
            Text(
              dangerCount > 0
                  ? "⚠️ $dangerCount member in danger zone"
                  : "All members verified & connected",
              style: TextStyle(
                fontSize: 12,
                color: dangerCount > 0 ? const Color(0xFFEF4444) : const Color(0xFF10B981),
              ),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1-Tap "I Am Safe" Broadcast Action
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          "1-Tap Safety Beacon",
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "Pushes real-time GPS & battery status to your family group instantly.",
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: _broadcastIamSafe,
                    icon: const Icon(Icons.shield, size: 18),
                    label: const Text(
                      "I AM SAFE",
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      shape: RoundedCornerShape(12),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Interactive Panic Radar
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text(
                        "Live Panic Radar (15km Range)",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        "GPS Synchronized",
                        style: TextStyle(color: Color(0xFF38BDF8), fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 240,
                    width: double.infinity,
                    child: AnimatedBuilder(
                      animation: _radarController,
                      builder: (context, child) {
                        return CustomPaint(
                          painter: FamilyRadarPainter(
                            sweepAngle: _radarController.value * 2 * pi,
                            members: _familyMembers,
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildLegend(const Color(0xFF10B981), "Safe Blip"),
                      _buildLegend(const Color(0xFFEF4444), "SOS / Danger Blip"),
                      _buildLegend(const Color(0xFF38BDF8), "Your Location"),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Family Member List Header
            const Text(
              "Circle Members",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),

            ..._familyMembers.map((member) => _buildMemberTile(member)),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildLegend(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
        ),
      ],
    );
  }

  Widget _buildMemberTile(FamilyMemberModel member) {
    final isDanger = member.status == SafetyStatus.inDanger;
    final color = isDanger ? const Color(0xFFEF4444) : const Color(0xFF10B981);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDanger ? const Color(0xFFEF4444).withOpacity(0.6) : const Color(0xFF334155),
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: color.withOpacity(0.2),
            foregroundColor: color,
            child: Text(
              member.name[0],
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      member.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      "(${member.relationship})",
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  "${member.location} • ${member.distanceKm} km",
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      Icons.battery_charging_full,
                      size: 13,
                      color: member.batteryPercent < 20 ? Colors.red : Colors.green,
                    ),
                    const SizedBox(width: 3),
                    Text(
                      "${member.batteryPercent}%",
                      style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      "Checked in: ${member.lastCheckIn}",
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
                    ),
                  ],
                ),
              ],
            ),
          ),
          OutlinedButton(
            onPressed: () => _toggleMemberSafety(member),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: color),
              foregroundColor: color,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              shape: RoundedCornerShape(8),
            ),
            child: Text(
              isDanger ? "DANGER" : "SAFE",
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }
}

class FamilyRadarPainter extends CustomPainter {
  final double sweepAngle;
  final List<FamilyMemberModel> members;

  FamilyRadarPainter({
    required this.sweepAngle,
    required this.members,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = min(size.width, size.height) / 2 * 0.9;

    final ringPaint = Paint()
      ..color = const Color(0xFF334155)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;

    // Draw 3 Range Rings
    canvas.drawCircle(center, maxRadius * 0.33, ringPaint);
    canvas.drawCircle(center, maxRadius * 0.66, ringPaint);
    canvas.drawCircle(center, maxRadius, ringPaint);

    // Crosshairs
    canvas.drawLine(
      Offset(center.dx, center.dy - maxRadius),
      Offset(center.dx, center.dy + maxRadius),
      ringPaint,
    );
    canvas.drawLine(
      Offset(center.dx - maxRadius, center.dy),
      Offset(center.dx + maxRadius, center.dy),
      ringPaint,
    );

    // Sweep Line
    final sweepEnd = Offset(
      center.dx + maxRadius * cos(sweepAngle),
      center.dy + maxRadius * sin(sweepAngle),
    );
    final sweepPaint = Paint()
      ..shader = LinearGradient(
        colors: [const Color(0xFF38BDF8).withOpacity(0.7), Colors.transparent],
      ).createShader(Rect.fromPoints(center, sweepEnd))
      ..strokeWidth = 2.5;
    canvas.drawLine(center, sweepEnd, sweepPaint);

    // Self Marker (Center)
    canvas.drawCircle(center, 6, Paint()..color = const Color(0xFF38BDF8));

    // Plot Family Members
    for (int i = 0; i < members.length; i++) {
      final member = members[i];
      final angle = (i * 72.0 + 35.0) * (pi / 180.0);
      final distRatio = (member.distanceKm / 15.0).clamp(0.2, 0.88);
      final blipCenter = Offset(
        center.dx + (maxRadius * distRatio) * cos(angle),
        center.dy + (maxRadius * distRatio) * sin(angle),
      );

      final isDanger = member.status == SafetyStatus.inDanger;
      final color = isDanger ? const Color(0xFFEF4444) : const Color(0xFF10B981);

      if (isDanger) {
        canvas.drawCircle(
          blipCenter,
          14,
          Paint()
            ..color = const Color(0xFFEF4444).withOpacity(0.4)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2,
        );
      }

      canvas.drawCircle(blipCenter, 6, Paint()..color = color);
    }
  }

  @override
  bool shouldRepaint(covariant FamilyRadarPainter oldDelegate) => true;
}
