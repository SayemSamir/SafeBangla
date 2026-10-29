import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/family_safety_radar_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const SafeBanglaApp());
}

// ==========================================
// 1. GLASSMORPHISM THEME & COLOR PALETTE
// ==========================================
class AppColors {
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color glassSurface = Color(0x2E1E293B);
  static const Color glassBorder = Color(0x3338BDF8);
  static const Color emergencyRed = Color(0xFFDC2626);
  static const Color emergencyRedGlow = Color(0xFFFF4D4D);
  static const Color warningYellow = Color(0xFFF59E0B);
  static const Color hazardOrange = Color(0xFFEA580C);
  static const Color safetyCyan = Color(0xFF06B6D4);
  static const Color bengalGreen = Color(0xFF10B981);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textMuted = Color(0xFF94A3B8);
}

class GlassmorphicContainer extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  final Color? borderColor;

  const GlassmorphicContainer({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.padding,
    this.borderRadius,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? BorderRadius.circular(16);
    return ClipRRect(
      borderRadius: radius,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          width: width,
          height: height,
          padding: padding ?? const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.glassSurface,
            borderRadius: radius,
            border: Border.all(
              color: borderColor ?? AppColors.glassBorder,
              width: 1.2,
            ),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.white.withOpacity(0.08),
                Colors.white.withOpacity(0.02),
              ],
            ),
          ),
          child: child,
        ),
      ),
    );
  }
}

// ==========================================
// 2. DATA MODELS
// ==========================================
class OfficialAlert {
  final String id;
  final String title;
  final String banglaTitle;
  final String signalLevel;
  final String description;
  final String banglaDescription;
  final String issuedAt;
  final List<String> affectedRegions;
  final String imageUrl;

  OfficialAlert({
    required this.id,
    required this.title,
    required this.banglaTitle,
    required this.signalLevel,
    required this.description,
    required this.banglaDescription,
    required this.issuedAt,
    required this.affectedRegions,
    required this.imageUrl,
  });
}

class CommunityHazard {
  final String id;
  final String title;
  final String banglaTitle;
  final String location;
  final String timeAgo;
  final String category;
  final String reporter;
  final String imageUrl;
  int upvotes;
  int downvotes;
  bool isVerified;
  bool userVotedUp;
  bool userVotedDown;

  CommunityHazard({
    required this.id,
    required this.title,
    required this.banglaTitle,
    required this.location,
    required this.timeAgo,
    required this.category,
    required this.reporter,
    required this.imageUrl,
    this.upvotes = 0,
    this.downvotes = 0,
    this.isVerified = false,
    this.userVotedUp = false,
    this.userVotedDown = false,
  });
}

// ==========================================
// 3. REACTIVE CONTROLLER (GETX)
// ==========================================
class EmergencyController extends GetxController {
  var isSosActive = false.obs;
  var isSosHolding = false.obs;
  var sosHoldProgress = 0.0.obs;
  var isOfflineBlackout = false.obs;
  var isBangla = true.obs;
  var currentlySpeakingId = "".obs;

  Timer? _holdTimer;

  var officialAlerts = <OfficialAlert>[
    OfficialAlert(
      id: "ALERT-BMD-10",
      title: "Severe Cyclone 'Moni' - Great Danger Signal 10",
      banglaTitle: "তীব্র ঘূর্ণিঝড় 'মনি' - মহাবিপদ সংকেত ১০",
      signalLevel: "Signal 10 (Great Danger)",
      description: "Severe cyclonic storm over Bay of Bengal heading towards Cox's Bazar and Chattogram coast with tidal surge 8-12 feet above normal.",
      banglaDescription: "বঙ্গোপসাগরে সৃষ্ট তীব্র ঘূর্ণিঝড় 'মনি' উপকূলের দিকে ধাবিত হচ্ছে। কক্সবাজার ও চট্টগ্রাম সমুদ্রবন্দরকে ১০ নম্বর মহাবিপদ সংকেত দেখাতে বলা হয়েছে।",
      issuedAt: "15 mins ago • BMD Dhaka",
      affectedRegions: ["Cox's Bazar", "Chattogram", "Barguna", "Noakhali"],
      imageUrl: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800",
    ),
    OfficialAlert(
      id: "ALERT-BWDB-02",
      title: "Flash Flood Warning - Surma & Kushiyara Basin",
      banglaTitle: "আকস্মিক বন্যা সতর্কবার্তা - সুরমা ও কুশিয়ারা অববাহিকা",
      signalLevel: "Flood Alert RED",
      description: "Surma River is flowing 65 cm above danger level at Sunamganj point due to upstream Meghalaya runoff.",
      banglaDescription: "মেঘালয় থেকে নেমে আসা তীব্র পাহাড়ি ঢলে সুরমা নদীর পানি সুনামগঞ্জ পয়েন্টে বিপৎসীমার ৬৫ সেমি ওপর দিয়ে বইছে।",
      issuedAt: "1 hour ago • BWDB",
      affectedRegions: ["Sunamganj", "Sylhet", "Netrokona"],
      imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800",
    ),
  ].obs;

  var communityHazards = <CommunityHazard>[
    CommunityHazard(
      id: "HAZ-01",
      title: "Live High-Voltage Fallen Wire in Flood Water",
      banglaTitle: "পানিতে নিমজ্জিত জীবন্ত হাইভোল্টেজ বৈদ্যুতিক তার",
      location: "Anwara Pilot School Road, Chattogram",
      timeAgo: "22 mins ago",
      category: "Live Electric Wire",
      reporter: "Kazi Rayhan (Volunteer)",
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?w=800",
      upvotes: 24,
      downvotes: 1,
      isVerified: true,
    ),
    CommunityHazard(
      id: "HAZ-02",
      title: "Coastal Polder 43 Embankment Overflow",
      banglaTitle: "উপকূলীয় পোল্ডার ৪৩ এর বাঁধে তীব্র ভাঙন",
      location: "Patharghata Union 2, Barguna",
      timeAgo: "45 mins ago",
      category: "Embankment Breach",
      reporter: "Shafiqul Islam",
      imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800",
      upvotes: 18,
      downvotes: 0,
      isVerified: true,
    ),
  ].obs;

  void startSosHold() {
    isSosHolding.value = true;
    sosHoldProgress.value = 0.0;
    _holdTimer?.cancel();
    _holdTimer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      sosHoldProgress.value += 0.05 / 3.0;
      if (sosHoldProgress.value >= 1.0) {
        timer.cancel();
        isSosHolding.value = false;
        triggerEmergencySos();
      }
    });
  }

  void cancelSosHold() {
    isSosHolding.value = false;
    sosHoldProgress.value = 0.0;
    _holdTimer?.cancel();
  }

  void triggerEmergencySos() {
    isSosActive.value = true;
    HapticFeedback.heavyImpact();
    Get.snackbar(
      "EMERGENCY BROADCAST ACTIVE",
      "GPS Coordinates & 10s silent audio transmitted to Red Crescent & Coast Guard",
      backgroundColor: AppColors.emergencyRed,
      colorText: Colors.white,
      snackPosition: SnackPosition.TOP,
      duration: const Duration(seconds: 4),
    );
  }

  void upvoteHazard(String id) {
    final hazard = communityHazards.firstWhere((h) => h.id == id);
    if (hazard.userVotedUp) {
      hazard.upvotes--;
      hazard.userVotedUp = false;
    } else {
      hazard.upvotes++;
      if (hazard.userVotedDown) {
        hazard.downvotes--;
        hazard.userVotedDown = false;
      }
      hazard.userVotedUp = true;
    }
    if (hazard.upvotes >= 10) hazard.isVerified = true;
    communityHazards.refresh();
  }

  void downvoteHazard(String id) {
    final hazard = communityHazards.firstWhere((h) => h.id == id);
    if (hazard.userVotedDown) {
      hazard.downvotes--;
      hazard.userVotedDown = false;
    } else {
      hazard.downvotes++;
      if (hazard.userVotedUp) {
        hazard.upvotes--;
        hazard.userVotedUp = false;
      }
      hazard.userVotedDown = true;
    }
    communityHazards.refresh();
  }

  void playBanglaTts(String id, String text) {
    if (currentlySpeakingId.value == id) {
      currentlySpeakingId.value = "";
    } else {
      currentlySpeakingId.value = id;
      HapticFeedback.lightImpact();
      Future.delayed(const Duration(seconds: 4), () {
        if (currentlySpeakingId.value == id) {
          currentlySpeakingId.value = "";
        }
      });
    }
  }
}

// ==========================================
// 4. MAIN APP ROOT & NAVIGATION
// ==========================================
class SafeBanglaApp extends StatelessWidget {
  const SafeBanglaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'SafeBangla',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.darkBackground,
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      ),
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  final EmergencyController controller = Get.put(EmergencyController());

  final List<Widget> _screens = const [
    HomeDashboardScreen(),
    DisasterNewsFeedScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.darkBackground,
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: AppColors.safetyCyan,
          unselectedItemColor: AppColors.textMuted,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.shield),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.campaign),
              label: 'News & Hazards',
            ),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// 5. HOME DASHBOARD SCREEN
// ==========================================
class HomeDashboardScreen extends StatelessWidget {
  const HomeDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final EmergencyController controller = Get.find<EmergencyController>();

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.emergencyRed,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.emergencyRedGlow.withOpacity(0.5),
                    blurRadius: 10,
                  )
                ],
              ),
              child: const Icon(Icons.shield, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            Text(
              'SafeBangla',
              style: GoogleFonts.outfit(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.wifi_off, color: AppColors.warningYellow),
            onPressed: () => controller.isOfflineBlackout.toggle(),
          ),
          Obx(
            () => TextButton(
              onPressed: () => controller.isBangla.toggle(),
              child: Text(
                controller.isBangla.value ? "বাংলা" : "ENG",
                style: const TextStyle(
                  color: AppColors.safetyCyan,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Live Weather Alert Ticker
            GlassmorphicContainer(
              borderColor: AppColors.emergencyRedGlow.withOpacity(0.6),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: AppColors.warningYellow, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "BMD BULLETIN #14 • GREAT DANGER SIGNAL 10",
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            color: AppColors.warningYellow,
                            letterSpacing: 1.1,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "Severe Cyclone 'Moni' approaching Bay of Bengal. Tidal surges 8-12ft expected.",
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Pulsing Red 3-Second Hold SOS Button
            Center(
              child: GestureDetector(
                onTapDown: (_) => controller.startSosHold(),
                onTapUp: (_) => controller.cancelSosHold(),
                onTapCancel: () => controller.cancelSosHold(),
                child: Obx(
                  () => Stack(
                    alignment: Alignment.Center,
                    children: [
                      // Pulsing outer halo
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        width: controller.isSosHolding.value ? 230 : 210,
                        height: controller.isSosHolding.value ? 230 : 210,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.emergencyRed.withOpacity(0.2),
                        ),
                      ),
                      // Circular Progress Indicator
                      if (controller.isSosHolding.value)
                        SizedBox(
                          width: 190,
                          height: 190,
                          child: CircularProgressIndicator(
                            value: controller.sosHoldProgress.value,
                            strokeWidth: 8,
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.warningYellow),
                            backgroundColor: Colors.white24,
                          ),
                        ),
                      // Core Red Button
                      Container(
                        width: 160,
                        height: 160,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const RadialGradient(
                            colors: [
                              AppColors.emergencyRedGlow,
                              AppColors.emergencyRed,
                              Color(0xFF7F1D1D),
                            ],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.emergencyRed.withOpacity(0.6),
                              blurRadius: 25,
                              spreadRadius: 4,
                            ),
                          ],
                          border: Border.all(color: Colors.white, width: 3),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.touch_app, color: Colors.white, size: 36),
                            Text(
                              "SOS",
                              style: GoogleFonts.outfit(
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: 2,
                              ),
                            ),
                            Text(
                              controller.isSosHolding.value
                                  ? "${(3 - (controller.sosHoldProgress.value * 3)).ceil()}s..."
                                  : "HOLD 3 SEC",
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.white70,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 28),

            // Emergency Modules Grid
            Text(
              "EMERGENCY MODULES",
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: AppColors.textMuted,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),

            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.25,
              children: [
                _buildGridCard(
                  Icons.family_restroom,
                  "Family Panic Radar",
                  "4 Members Live",
                  AppColors.safetyCyan,
                  onTap: () => Get.to(() => const FamilySafetyRadarScreen()),
                ),
                _buildGridCard(
                  Icons.qr_code_2,
                  "Shelter Virtual Queue",
                  "Smart Load Balancer",
                  AppColors.warningYellow,
                  onTap: () => Get.to(() => const FamilySafetyRadarScreen()),
                ),
                _buildGridCard(Icons.holiday_village, "Cyclone Shelters", "820/1500 Capacity", AppColors.bengalGreen),
                _buildGridCard(Icons.local_hospital, "Nearby Hospitals", "ICU Beds: 14 Free", AppColors.safetyCyan),
                _buildGridCard(Icons.phone_in_talk, "Emergency 999", "National Hotline", AppColors.emergencyRed),
                _buildGridCard(Icons.smart_toy, "AI Crisis Guide", "Bangla & English NLP", AppColors.warningYellow),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGridCard(IconData icon, String title, String subtitle, Color color, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: GlassmorphicContainer(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            Text(
              subtitle,
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
      ),
    );
  }
}

// ==========================================
// 6. DISASTER NEWS & HAZARDS SCREEN
// ==========================================
class DisasterNewsFeedScreen extends StatelessWidget {
  const DisasterNewsFeedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final EmergencyController controller = Get.find<EmergencyController>();

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.darkBackground,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text(
            "Disaster News & Hazards",
            style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          bottom: TabBar(
            indicatorColor: AppColors.safetyCyan,
            labelColor: Colors.white,
            unselectedLabelColor: AppColors.textMuted,
            indicatorWeight: 3,
            tabs: const [
              Tab(text: "Official Alerts (BMD)"),
              Tab(text: "Community Hazards"),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Tab 1: Official BMD Alerts
            ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: controller.officialAlerts.length,
              itemBuilder: (context, index) {
                final alert = controller.officialAlerts[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: GlassmorphicContainer(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Image attachment
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Image.network(
                            alert.imageUrl,
                            height: 140,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              height: 140,
                              color: Colors.black38,
                              child: const Icon(Icons.broken_image, color: Colors.white54),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.emergencyRed.withOpacity(0.3),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: AppColors.emergencyRed),
                              ),
                              child: Text(
                                alert.signalLevel,
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ),
                            Text(alert.issuedAt, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          alert.title,
                          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          alert.description,
                          style: GoogleFonts.inter(fontSize: 12, color: Colors.white70, height: 1.4),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.location_on, color: AppColors.safetyCyan, size: 16),
                                const SizedBox(width: 4),
                                Text(
                                  alert.affectedRegions.join(", "),
                                  style: const TextStyle(fontSize: 11, color: AppColors.safetyCyan, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            // Bangla TTS Audio Button
                            Obx(
                              () => ElevatedButton.icon(
                                onPressed: () => controller.playBanglaTts(alert.id, alert.banglaDescription),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: controller.currentlySpeakingId.value == alert.id
                                      ? AppColors.bengalGreen
                                      : Colors.white.withOpacity(0.1),
                                  shape: RoundedCornerShape(8),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                ),
                                icon: Icon(
                                  controller.currentlySpeakingId.value == alert.id
                                      ? Icons.volume_up
                                      : Icons.spatial_audio,
                                  size: 16,
                                  color: Colors.white,
                                ),
                                label: Text(
                                  controller.currentlySpeakingId.value == alert.id ? "Speaking..." : "Bangla TTS",
                                  style: const TextStyle(fontSize: 11, color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            // Tab 2: Community Hazards
            ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: controller.communityHazards.length,
              itemBuilder: (context, index) {
                final hazard = controller.communityHazards[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: GlassmorphicContainer(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              hazard.category,
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.hazardOrange),
                            ),
                            if (hazard.isVerified)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.bengalGreen.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: AppColors.bengalGreen),
                                ),
                                child: const Text("VERIFIED", style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.bengalGreen)),
                              ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          hazard.title,
                          style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.place, size: 12, color: AppColors.textMuted),
                            const SizedBox(width: 4),
                            Text(
                              "${hazard.location} • ${hazard.timeAgo}",
                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                IconButton(
                                  icon: Icon(
                                    Icons.thumb_up,
                                    size: 16,
                                    color: hazard.userVotedUp ? AppColors.bengalGreen : Colors.white70,
                                  ),
                                  onPressed: () => controller.upvoteHazard(hazard.id),
                                ),
                                Text("${hazard.upvotes}", style: const TextStyle(color: Colors.white, fontSize: 12)),
                                IconButton(
                                  icon: Icon(
                                    Icons.thumb_down,
                                    size: 16,
                                    color: hazard.userVotedDown ? AppColors.emergencyRed : Colors.white70,
                                  ),
                                  onPressed: () => controller.downvoteHazard(hazard.id),
                                ),
                              ],
                            ),
                            Obx(
                              () => ElevatedButton.icon(
                                onPressed: () => controller.playBanglaTts(hazard.id, hazard.banglaTitle),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: controller.currentlySpeakingId.value == hazard.id
                                      ? AppColors.bengalGreen
                                      : Colors.white.withOpacity(0.1),
                                  shape: RoundedCornerShape(8),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                ),
                                icon: const Icon(Icons.volume_up, size: 14, color: Colors.white),
                                label: const Text("Audio", style: TextStyle(fontSize: 11, color: Colors.white)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
