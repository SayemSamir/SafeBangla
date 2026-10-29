package com.example.data.model

enum class UserRole(val displayName: String, val banglaName: String) {
    CITIZEN("Citizen", "নাগরিক"),
    VOLUNTEER("Volunteer", "স্বেচ্ছাসেবক"),
    RESCUE_TEAM("Rescue Team", "উদ্ধারকারী দল"),
    ADMIN("Disaster Admin", "প্রশাসক")
}

enum class Language {
    ENGLISH,
    BANGLA
}

enum class Severity(val label: String, val banglaLabel: String, val level: Int) {
    LOW("Low", "স্বাভাবিক", 1),
    MEDIUM("Medium", "মাঝারি", 2),
    HIGH("High", "উচ্চ", 3),
    CRITICAL("Critical", "জরুরি বিপদজনক", 4)
}

enum class DisasterType(val label: String, val banglaLabel: String) {
    FLOOD("Flood / Haor Inundation", "বন্যা / প্লাবন"),
    CYCLONE("Cyclone / Tidal Surge", "ঘূর্ণিঝড় / জলোচ্ছ্বাস"),
    EARTHQUAKE("Earthquake", "ভূমিকম্প"),
    FIRE("Fire / Urban Blaze", "অগ্নিকাণ্ড"),
    MEDICAL("Medical / Snakebite", "চিকিৎসা জরুরি / সর্পদংশন")
}

enum class SosStatus(val label: String, val banglaLabel: String) {
    PENDING("Broadcasting (Unassigned)", "অপেক্ষমান"),
    ASSIGNED("Volunteer En Route", "স্বেচ্ছাসেবক নিযুক্ত"),
    RESCUE_DEPLOYED("Rescue Boat Deployed", "উদ্ধারকারী বোট রওয়ানা"),
    RESOLVED("Safely Evacuated", "উদ্ধার সম্পন্ন")
}

data class SosAlert(
    val id: String,
    val victimName: String,
    val phone: String,
    val latitude: Double,
    val longitude: Double,
    val locationName: String,
    val division: String,
    val timestamp: Long,
    val severity: Severity,
    val disasterType: DisasterType,
    val status: SosStatus,
    val peopleCount: Int,
    val waterLevelCm: Int = 0,
    val notes: String = "",
    val audioDurationSeconds: Int = 10,
    val isSilentMode: Boolean = false,
    val isOfflineSms: Boolean = false,
    val isBleMeshRelayed: Boolean = false,
    val meshHopCount: Int = 0,
    val assignedVolunteer: String? = null,
    val assignedUnit: String? = null
)

enum class ShelterStatus {
    AVAILABLE,
    FILLING_FAST,
    FULL
}

data class Shelter(
    val id: String,
    val name: String,
    val banglaName: String,
    val district: String,
    val latitude: Double,
    val longitude: Double,
    val totalCapacity: Int,
    val currentOccupancy: Int,
    val status: ShelterStatus,
    val hasFoodSupply: Boolean,
    val hasCleanWater: Boolean,
    val hasMedicalFirstAid: Boolean,
    val hasPowerGenerator: Boolean,
    val hasBoatDock: Boolean,
    val contactPhone: String,
    val distanceKm: Double = 1.8
)

data class Hospital(
    val id: String,
    val name: String,
    val banglaName: String,
    val district: String,
    val latitude: Double,
    val longitude: Double,
    val availableIcuBeds: Int,
    val availableErBeds: Int,
    val ambulanceFleetCount: Int,
    val bloodBankUnits: Map<String, Int>,
    val contactPhone: String,
    val distanceKm: Double = 3.2
)

data class DisasterAlert(
    val id: String,
    val title: String,
    val banglaTitle: String,
    val signalLevel: String,
    val affectedRegions: List<String>,
    val severity: Severity,
    val description: String,
    val banglaDescription: String,
    val issuedAt: String,
    val safetyDirective: String,
    val banglaSafetyDirective: String
)

data class VolunteerProfile(
    val name: String,
    val phone: String,
    val bloodGroup: String,
    val division: String,
    val verifiedBadge: Boolean = true,
    val missionsCompleted: Int = 18,
    val hoursLogged: Double = 64.5,
    val badges: List<String> = listOf("Cyclone Warrior", "Delta Guardian", "First Aid Certified", "Boat Pilot"),
    val rankTitle: String = "Senior Delta Responder"
)

data class MeshRelayNode(
    val id: String,
    val nodeName: String,
    val roleType: String,
    val distanceMeters: Int,
    val batteryPct: Int,
    val isConnected: Boolean,
    val signalStrengthDbm: Int,
    val isGateway: Boolean = false
)

data class ChatMessage(
    val id: String,
    val isUser: Boolean,
    val textEnglish: String,
    val textBangla: String,
    val timestamp: Long = System.currentTimeMillis()
)

// === Advanced Systems Architecture Models ===

enum class DroneType(val label: String) {
    AERIAL_SUPPLY_HEXACOPTER("Aerial Supply Hexacopter"),
    AMPHIBIOUS_RESCUE_ROBOT("Amphibious Haor Rescue Rover"),
    MEDICAL_AIRDROP_UAV("Rapid Medical Airdrop Drone"),
    THERMAL_RECON_DRONE("Night Thermal Survivor Recon")
}

enum class DroneStatus(val label: String) {
    PATROLLING("Patrolling Sector"),
    DELIVERING_PAYLOAD("En-route to Drop Zone"),
    MISSION_ACCOMPLISHED("Payload Delivered"),
    RETURNING_TO_BASE("Returning to Mobile Dock"),
    STANDBY("Standby at Relief Base")
}

data class DroneUnit(
    val id: String,
    val callsign: String,
    val type: DroneType,
    val status: DroneStatus,
    val batteryPct: Int,
    val currentAltitudeMeters: Int,
    val speedKmh: Int,
    val payloadDescription: String,
    val payloadKg: Double,
    val latitude: Double,
    val longitude: Double,
    val destinationZone: String,
    val telemetryDbm: Int = -58,
    val hasVideoFeed: Boolean = true
)

enum class HazardCategory(val label: String, val banglaLabel: String) {
    ROAD_BLOCKAGE("Road Blockage / Landslide", "সড়ক অবরোধ / ভূমিধস"),
    FALLEN_ELECTRIC_WIRE("Live Fallen Electric Wire", "ছেঁড়া বিদ্যুৎ পরিবাহী তার"),
    EMBANKMENT_BREACH("Embankment Breach", "নদী বা উপকূলীয় বাঁধ ভাঙন"),
    SEVERE_WATERLOGGING("Deep Waterlogging / Submerged Road", "বিপজ্জনক নিমজ্জিত রাস্তা"),
    BRIDGE_COLLAPSED("Culvert / Wooden Bridge Broken", "কালভার্ট বা সাঁকো ভেঙে বিচ্ছিন্ন")
}

data class HazardReport(
    val id: String,
    val category: HazardCategory,
    val title: String,
    val banglaTitle: String,
    val locationName: String,
    val latitude: Double,
    val longitude: Double,
    val timestamp: Long,
    val upvotes: Int,
    val downvotes: Int,
    val isVerifiedByAuthority: Boolean,
    val reporterName: String,
    val urgency: Severity,
    val userVotedUp: Boolean = false,
    val userVotedDown: Boolean = false
)

enum class WaterTrend(val label: String, val banglaLabel: String) {
    RISING_RAPIDLY("Rising Rapidly (+12cm/hr)", "দ্রুত বৃদ্ধি পাচ্ছে"),
    STEADY("Steady at Danger Peak", "বিপৎসীমায় স্থির"),
    RECEDING("Receding Gradually", "ধীরে ধীরে নামছে")
}

data class WaterLevelSensor(
    val id: String,
    val stationName: String,
    val banglaStationName: String,
    val riverName: String,
    val district: String,
    val currentLevelMeters: Double,
    val dangerLevelMeters: Double,
    val rateOfRiseCmHr: Double,
    val trend: WaterTrend,
    val isTriggeringAlarm: Boolean,
    val lastWebhookPing: String
)

// === Next-Gen Crisis Intelligence Models ===

data class FamilyMember(
    val id: String,
    val name: String,
    val relationship: String,
    val phone: String,
    val latitude: Double,
    val longitude: Double,
    val isSafe: Boolean,
    val batteryPct: Int,
    val lastCheckIn: String,
    val distanceKm: Double,
    val bloodGroup: String = "O+"
)

data class ShelterToken(
    val tokenId: String,
    val shelterId: String,
    val shelterName: String,
    val citizenName: String,
    val tokenQrCode: String,
    val allottedZone: String,
    val queueNumber: Int,
    val issuedAt: String,
    val isRedirectedDueToLoad: Boolean = false,
    val redirectReason: String? = null,
    val originalShelterName: String? = null
)

data class VolunteerLeaderboardEntry(
    val rank: Int,
    val volunteerId: String,
    val name: String,
    val division: String,
    val points: Int,
    val missionsCompleted: Int,
    val hoursLogged: Double,
    val topBadge: String,
    val isCurrentUser: Boolean = false
)

data class AmbientAudioDetection(
    val id: String,
    val detectedAt: String,
    val soundType: String,
    val confidencePct: Int,
    val decibelLevel: Int,
    val threatLevel: Severity,
    val autoTriggeredSos: Boolean
)

