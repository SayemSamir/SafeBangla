package com.example.data.repository

import com.example.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.UUID

class SafeBanglaRepository {

    private val _sosAlerts = MutableStateFlow<List<SosAlert>>(getInitialSosAlerts())
    val sosAlerts: StateFlow<List<SosAlert>> = _sosAlerts.asStateFlow()

    private val _shelters = MutableStateFlow<List<Shelter>>(getInitialShelters())
    val shelters: StateFlow<List<Shelter>> = _shelters.asStateFlow()

    private val _hospitals = MutableStateFlow<List<Hospital>>(getInitialHospitals())
    val hospitals: StateFlow<List<Hospital>> = _hospitals.asStateFlow()

    private val _disasterAlerts = MutableStateFlow<List<DisasterAlert>>(getInitialDisasterAlerts())
    val disasterAlerts: StateFlow<List<DisasterAlert>> = _disasterAlerts.asStateFlow()

    private val _volunteerProfile = MutableStateFlow(
        VolunteerProfile(
            name = "Kazi Rayhan",
            phone = "+880 1712-345678",
            bloodGroup = "O+",
            division = "Chattogram & Cox's Bazar Sector",
            verifiedBadge = true,
            missionsCompleted = 24,
            hoursLogged = 78.5,
            badges = listOf("Cyclone Warrior", "Delta Guardian", "Haor Water Rescuer", "Certified First Responder")
        )
    )
    val volunteerProfile: StateFlow<VolunteerProfile> = _volunteerProfile.asStateFlow()

    private val _meshNodes = MutableStateFlow<List<MeshRelayNode>>(getInitialMeshNodes())
    val meshNodes: StateFlow<List<MeshRelayNode>> = _meshNodes.asStateFlow()

    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(getInitialChatMessages())
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    // Autonomous Drone & Robot Fleet
    private val _droneFleet = MutableStateFlow<List<DroneUnit>>(getInitialDroneFleet())
    val droneFleet: StateFlow<List<DroneUnit>> = _droneFleet.asStateFlow()

    // Crowdsourced Hazard Reports
    private val _hazardReports = MutableStateFlow<List<HazardReport>>(getInitialHazardReports())
    val hazardReports: StateFlow<List<HazardReport>> = _hazardReports.asStateFlow()

    // IoT Water-Level Flood Gauge Sensors
    private val _waterSensors = MutableStateFlow<List<WaterLevelSensor>>(getInitialWaterSensors())
    val waterSensors: StateFlow<List<WaterLevelSensor>> = _waterSensors.asStateFlow()

    // Family Safety Circle
    private val _familyMembers = MutableStateFlow<List<FamilyMember>>(getInitialFamilyMembers())
    val familyMembers: StateFlow<List<FamilyMember>> = _familyMembers.asStateFlow()

    // Digital Shelter Virtual Queue & Load Balancer Tokens
    private val _shelterTokens = MutableStateFlow<List<ShelterToken>>(listOf())
    val shelterTokens: StateFlow<List<ShelterToken>> = _shelterTokens.asStateFlow()

    // Gamified Volunteer Leaderboard
    private val _volunteerLeaderboard = MutableStateFlow<List<VolunteerLeaderboardEntry>>(getInitialLeaderboard())
    val volunteerLeaderboard: StateFlow<List<VolunteerLeaderboardEntry>> = _volunteerLeaderboard.asStateFlow()

    // AI Ambient Panic Audio Detections Log
    private val _ambientAudioLogs = MutableStateFlow<List<AmbientAudioDetection>>(getInitialAudioDetections())
    val ambientAudioLogs: StateFlow<List<AmbientAudioDetection>> = _ambientAudioLogs.asStateFlow()

    fun triggerCitizenSos(
        name: String,
        phone: String,
        latitude: Double,
        longitude: Double,
        locationName: String,
        division: String,
        type: DisasterType,
        severity: Severity,
        peopleCount: Int,
        waterLevelCm: Int,
        notes: String,
        isSilent: Boolean,
        isOfflineSms: Boolean,
        isBleRelayed: Boolean
    ): SosAlert {
        val newAlert = SosAlert(
            id = "SOS-${UUID.randomUUID().toString().take(6).uppercase()}",
            victimName = name.ifBlank { "Citizen in Distress" },
            phone = phone.ifBlank { "+880 1819-999888" },
            latitude = latitude,
            longitude = longitude,
            locationName = locationName,
            division = division,
            timestamp = System.currentTimeMillis(),
            severity = severity,
            disasterType = type,
            status = SosStatus.PENDING,
            peopleCount = peopleCount,
            waterLevelCm = waterLevelCm,
            notes = notes,
            isSilentMode = isSilent,
            isOfflineSms = isOfflineSms,
            isBleMeshRelayed = isBleRelayed,
            meshHopCount = if (isBleRelayed) 3 else 0
        )
        _sosAlerts.update { listOf(newAlert) + it }
        return newAlert
    }

    fun acceptMission(sosId: String, volunteerName: String) {
        _sosAlerts.update { alerts ->
            alerts.map { alert ->
                if (alert.id == sosId) {
                    alert.copy(
                        status = SosStatus.ASSIGNED,
                        assignedVolunteer = volunteerName
                    )
                } else alert
            }
        }
        _volunteerProfile.update {
            it.copy(
                missionsCompleted = it.missionsCompleted + 1,
                hoursLogged = it.hoursLogged + 2.5
            )
        }
    }

    fun deployRescueUnit(sosId: String, unitType: String) {
        _sosAlerts.update { alerts ->
            alerts.map { alert ->
                if (alert.id == sosId) {
                    alert.copy(
                        status = SosStatus.RESCUE_DEPLOYED,
                        assignedUnit = unitType
                    )
                } else alert
            }
        }
    }

    fun markResolved(sosId: String) {
        _sosAlerts.update { alerts ->
            alerts.map { alert ->
                if (alert.id == sosId) {
                    alert.copy(status = SosStatus.RESOLVED)
                } else alert
            }
        }
    }

    fun updateShelterOccupancy(shelterId: String, delta: Int) {
        _shelters.update { shelters ->
            shelters.map { s ->
                if (s.id == shelterId) {
                    val newCount = (s.currentOccupancy + delta).coerceIn(0, s.totalCapacity + 200)
                    val newStatus = when {
                        newCount >= s.totalCapacity -> ShelterStatus.FULL
                        newCount >= s.totalCapacity * 0.85 -> ShelterStatus.FILLING_FAST
                        else -> ShelterStatus.AVAILABLE
                    }
                    s.copy(currentOccupancy = newCount, status = newStatus)
                } else s
            }
        }
    }

    fun broadcastNewAlert(alert: DisasterAlert) {
        _disasterAlerts.update { listOf(alert) + it }
    }

    // Drone Operations
    fun dispatchDroneToMission(droneId: String, missionTarget: String) {
        _droneFleet.update { fleet ->
            fleet.map { drone ->
                if (drone.id == droneId) {
                    drone.copy(
                        status = DroneStatus.DELIVERING_PAYLOAD,
                        destinationZone = missionTarget,
                        speedKmh = 48
                    )
                } else drone
            }
        }
    }

    fun triggerAirdrop(droneId: String) {
        _droneFleet.update { fleet ->
            fleet.map { drone ->
                if (drone.id == droneId) {
                    drone.copy(
                        status = DroneStatus.MISSION_ACCOMPLISHED,
                        payloadKg = 0.0,
                        payloadDescription = "Payload successfully parachuted into drop zone"
                    )
                } else drone
            }
        }
    }

    // Crowdsourced Hazard Voting and Creation
    fun upvoteHazard(hazardId: String) {
        _hazardReports.update { reports ->
            reports.map { r ->
                if (r.id == hazardId) {
                    val newUp = if (r.userVotedUp) r.upvotes - 1 else r.upvotes + 1
                    val newDown = if (r.userVotedDown) r.downvotes - 1 else r.downvotes
                    r.copy(
                        upvotes = newUp,
                        downvotes = newDown,
                        userVotedUp = !r.userVotedUp,
                        userVotedDown = false,
                        isVerifiedByAuthority = newUp >= 10
                    )
                } else r
            }
        }
    }

    fun downvoteHazard(hazardId: String) {
        _hazardReports.update { reports ->
            reports.map { r ->
                if (r.id == hazardId) {
                    val newDown = if (r.userVotedDown) r.downvotes - 1 else r.downvotes + 1
                    val newUp = if (r.userVotedUp) r.upvotes - 1 else r.upvotes
                    r.copy(
                        downvotes = newDown,
                        upvotes = newUp,
                        userVotedDown = !r.userVotedDown,
                        userVotedUp = false
                    )
                } else r
            }
        }
    }

    fun reportNewHazard(
        category: HazardCategory,
        title: String,
        banglaTitle: String,
        locationName: String,
        latitude: Double,
        longitude: Double,
        urgency: Severity
    ): HazardReport {
        val newHazard = HazardReport(
            id = "HAZ-${UUID.randomUUID().toString().take(6).uppercase()}",
            category = category,
            title = title,
            banglaTitle = banglaTitle,
            locationName = locationName,
            latitude = latitude,
            longitude = longitude,
            timestamp = System.currentTimeMillis(),
            upvotes = 1,
            downvotes = 0,
            isVerifiedByAuthority = false,
            reporterName = "Verified Citizen",
            urgency = urgency,
            userVotedUp = false
        )
        _hazardReports.update { listOf(newHazard) + it }
        return newHazard
    }

    // IoT Water Sensor Webhook Simulation
    fun triggerSensorWebhookAlarm(sensorId: String, newLevelMeters: Double) {
        _waterSensors.update { sensors ->
            sensors.map { s ->
                if (s.id == sensorId) {
                    val isExceeded = newLevelMeters >= s.dangerLevelMeters
                    s.copy(
                        currentLevelMeters = newLevelMeters,
                        isTriggeringAlarm = isExceeded,
                        trend = if (isExceeded) WaterTrend.RISING_RAPIDLY else s.trend,
                        lastWebhookPing = "Just now via MQTT IoT Gateway"
                    )
                } else s
            }
        }
    }

    fun sendChatMessage(userText: String, isBangla: Boolean) {
        val userMsg = ChatMessage(
            id = UUID.randomUUID().toString(),
            isUser = true,
            textEnglish = userText,
            textBangla = userText
        )
        _chatMessages.update { it + userMsg }

        val response = generateCrisisAiResponse(userText, isBangla)
        val botMsg = ChatMessage(
            id = UUID.randomUUID().toString(),
            isUser = false,
            textEnglish = response.first,
            textBangla = response.second
        )
        _chatMessages.update { it + botMsg }
    }

    private fun generateCrisisAiResponse(query: String, isBangla: Boolean): Pair<String, String> {
        val lower = query.lowercase()
        return when {
            lower.contains("snake") || lower.contains("সাপ") || lower.contains("দংশন") -> {
                Pair(
                    "SNAKEBITE EMERGENCY PROTOCOL:\n1. Keep victim calm and completely still. Immobilize the bitten limb below heart level.\n2. Do NOT cut, suck venom, or apply tight tourniquets (causes tissue death).\n3. Remove rings/tight clothing before swelling starts.\n4. Call 999 immediately or reach the nearest Upazila Health Complex equipped with Anti-Venom (AVS).",
                    "সাপের কামড়ের জরুরি নির্দেশিকা:\n১. রোগীকে শান্ত রাখুন এবং নড়াচড়া করতে দেবেন না। কামড় দেওয়া অঙ্গটি বুকের নিচ বরাবর সোজা রাখুন।\n২. কোনো অবস্থাতেই ক্ষতস্থান কাটা, রক্ত চুষে নেওয়া বা শক্ত গিঁট দেওয়া যাবে না।\n৩. আংটি বা টাইট কাপড় দ্রুত খুলে ফেলুন যাতে ফোলা জায়গায় রক্ত চলাচল বন্ধ না হয়।\n৪. অবিলম্বে ৯৯৯ অথবা কাছের উপজেলা স্বাস্থ্য কমপ্লেক্সে নিয়ে যান যেখানে অ্যান্টি-ভেনম (AVS) মজুদ রয়েছে।"
                )
            }
            lower.contains("cyclone") || lower.contains("ঘূর্ণিঝড়") || lower.contains("সংকেত") || lower.contains("signal") -> {
                Pair(
                    "CYCLONE SAFETY GUIDE (Signal 8-10 Great Danger):\n1. Evacuate immediately to designated Cyclone Shelters (Paka Dalan).\n2. Secure emergency go-bag: dry food (chira, gur), drinking water, iodine, NID, torch, and cash.\n3. Turn off gas cylinders and main electrical switches.\n4. Anchor roofs with wire ropes. Keep livestock untied so they can swim.",
                    "ঘূর্ণিঝড় সতর্কতা ও আশ্রয় নির্দেশিকা:\n১. ৮-১০ নম্বর মহাবিপদ সংকেত জারি হলে কালবিলম্ব না করে নিকটস্থ পাকা সাইক্লোন শেল্টারে যান।\n২. জরুরি ব্যাগে শুকনা খাবার (চিড়া, গুড়), খাবার পানি, জরুরি ওষুধ, টর্চলাইট ও মূল্যবান কাগজপত্র পলিথিনে মুড়িয়ে রাখুন।\n৩. গ্যাস লাইন ও বিদ্যুতের মেইন সুইচ বন্ধ করে বের হোন।\n৪. গবাদি পশুকে দড়ি দিয়ে বেঁধে রাখবেন না, ছেড়ে দিন যাতে তারা সাঁতরে বাঁচতে পারে।"
                )
            }
            lower.contains("flood") || lower.contains("বন্যা") || lower.contains("পানি") || lower.contains("water") -> {
                Pair(
                    "FLASH FLOOD RESPONSE:\n1. Move elderly, children, and pregnant women to higher concrete structures or rooftop havens.\n2. Boil all water for 10 minutes or use water purification tablets (Halazone/Alum).\n3. Beware of submerged electric wires and poisonous snakes seeking dry ground.\n4. Use SafeBangla's 'Rescue Team' tab to request an emergency motorized rescue boat or autonomous airdrop drone.",
                    "বন্যা ও প্লাবন থেকে বাঁচার উপায়:\n১. শিশু, বৃদ্ধ ও অসুস্থদের দ্রুত উঁচু আশ্রয়কেন্দ্র বা পাকা ছাদে নিয়ে যান।\n২. পানি ফুটিয়ে (কমপক্ষে ১০ মিনিট) অথবা হ্যালোজেন/ফিটকিরি ট্যাবলেট দিয়ে বিশুদ্ধ করে পান করুন।\n৩. পানিতে নিমজ্জিত বৈদ্যুতিক তার ও শুকনো আশ্রয়ে আসা বিষধর সাপ থেকে সাবধান থাকুন।\n৪. নিরাপদ আশ্রয়ের জন্য অ্যাপের 'রেসকিউ টিম' বা ড্রোন সাপোর্ট থেকে জীবন রক্ষাকারী সামগ্রীর অনুরোধ পাঠান।"
                )
            }
            lower.contains("shelter") || lower.contains("শেল্টার") || lower.contains("আশ্রয়") -> {
                Pair(
                    "OFFLINE SHELTER LOCATOR:\nAll shelters are 100% pre-cached on your device. You can navigate offline using the built-in Compass.\n• Cox's Bazar Coastal Haven: 820/1500 (Available)\n• Anwara Multi-Purpose Cyclone Shelter: 1110/1200 (Filling Fast)\n• Sunamganj Haor Relief Centre: 980/1000 (Filling Fast)",
                    "অফলাইন আশ্রয়কেন্দ্র নির্দেশিকা:\nসকল আশ্রয়কেন্দ্রের তথ্য ডিভাইসে প্রাক-সংরক্ষিত আছে। ইন্টারনেট ছাড়াও সরাসরি অফলাইন কম্পাস দিয়ে পথ খুঁজে পাওয়া যাবে।\n• কক্সবাজার উপকূলীয় শেল্টার: ৮২০/১৫০০ (খালি আছে)\n• আনোয়ারা বহুমুখী সাইক্লোন সেন্টার: ১১১০/১২০০ (প্রায় পূর্ণ)\n• সুনামগঞ্জ হাওর ত্রাণ শিবির: ৯৮০/১০০০ (প্রায় পূর্ণ)"
                )
            }
            else -> {
                Pair(
                    "SafeBangla Crisis Bot: Stay calm. For immediate life-saving rescue, press and hold the Red SOS Button for 3 seconds or call national emergency 999. Tell me what emergency you are facing (Cyclone, Flood, Snakebite, or Evacuation).",
                    "সেফবাংলা ইমার্জেন্সি বট: শান্ত থাকুন। জরুরি জীবন রক্ষায় হোম স্ক্রিনের লাল এসওএস (SOS) বাটন ৩ সেকেন্ড চেপে ধরুন অথবা সরাসরি ৯৯৯ এ কল করুন। আপনার সমস্যা বিস্তারিত লিখুন (ঘূর্ণিঝড়, বন্যা, সাপের কামড় বা উদ্ধার)।"
                )
            }
        }
    }

    private fun getInitialSosAlerts(): List<SosAlert> = listOf(
        SosAlert(
            id = "SOS-8491",
            victimName = "Mohammad Tareq",
            phone = "+880 1812-445566",
            latitude = 21.4272,
            longitude = 91.9701,
            locationName = "Teknaf Coastal Union 4, Cox's Bazar",
            division = "Chattogram",
            timestamp = System.currentTimeMillis() - 1000 * 60 * 14,
            severity = Severity.CRITICAL,
            disasterType = DisasterType.CYCLONE,
            status = SosStatus.PENDING,
            peopleCount = 7,
            waterLevelCm = 140,
            notes = "Tidal surge entering homestead. 2 elderly persons and a 6-month infant trapped on tin roof.",
            audioDurationSeconds = 10,
            isSilentMode = false,
            isOfflineSms = false,
            isBleMeshRelayed = false
        ),
        SosAlert(
            id = "SOS-7120",
            victimName = "Farzana Akhter",
            phone = "+880 1799-332211",
            latitude = 25.0664,
            longitude = 91.4057,
            locationName = "Tahirpur Haor Basin, Sunamganj",
            division = "Sylhet",
            timestamp = System.currentTimeMillis() - 1000 * 60 * 42,
            severity = Severity.HIGH,
            disasterType = DisasterType.FLOOD,
            status = SosStatus.ASSIGNED,
            peopleCount = 5,
            waterLevelCm = 210,
            notes = "Haor overflowed. Family isolated without drinking water. Speedboat required.",
            assignedVolunteer = "Kazi Rayhan"
        ),
        SosAlert(
            id = "SOS-6302",
            victimName = "Nurul Islam",
            phone = "+880 1680-112233",
            latitude = 22.0125,
            longitude = 90.0432,
            locationName = "Patharghata Embankment Breach, Barguna",
            division = "Barishal",
            timestamp = System.currentTimeMillis() - 1000 * 60 * 85,
            severity = Severity.CRITICAL,
            disasterType = DisasterType.CYCLONE,
            status = SosStatus.RESCUE_DEPLOYED,
            peopleCount = 12,
            waterLevelCm = 175,
            notes = "Embankment broke. Red Crescent Rescue Unit 3 deploying motorized zodiac.",
            assignedUnit = "Bangladesh Coast Guard Delta Boat #4"
        ),
        SosAlert(
            id = "SOS-5519",
            victimName = "Shafiqul Alam",
            phone = "+880 1911-002288",
            latitude = 23.7088,
            longitude = 90.4162,
            locationName = "Sadarghat Old Dhaka Lowlands",
            division = "Dhaka",
            timestamp = System.currentTimeMillis() - 1000 * 60 * 120,
            severity = Severity.MEDIUM,
            disasterType = DisasterType.FLOOD,
            status = SosStatus.RESOLVED,
            peopleCount = 3,
            waterLevelCm = 45,
            notes = "Basement waterlogged. Evacuated safely to local primary school shelter."
        )
    )

    private fun getInitialShelters(): List<Shelter> = listOf(
        Shelter(
            id = "SH-01",
            name = "Cox's Bazar Coastal Haven Shelter",
            banglaName = "কক্সবাজার উপকূলীয় সাইক্লোন শেল্টার",
            district = "Cox's Bazar",
            latitude = 21.4350,
            longitude = 91.9800,
            totalCapacity = 1500,
            currentOccupancy = 820,
            status = ShelterStatus.AVAILABLE,
            hasFoodSupply = true,
            hasCleanWater = true,
            hasMedicalFirstAid = true,
            hasPowerGenerator = true,
            hasBoatDock = true,
            contactPhone = "+880 1819-010101",
            distanceKm = 1.4
        ),
        Shelter(
            id = "SH-02",
            name = "Anwara Multi-Purpose Cyclone Shelter",
            banglaName = "আনোয়ারা বহুমুখী দুর্যোগ আশ্রয়কেন্দ্র",
            district = "Chattogram",
            latitude = 22.2150,
            longitude = 91.9120,
            totalCapacity = 1200,
            currentOccupancy = 1110,
            status = ShelterStatus.FILLING_FAST,
            hasFoodSupply = true,
            hasCleanWater = true,
            hasMedicalFirstAid = true,
            hasPowerGenerator = true,
            hasBoatDock = true,
            contactPhone = "+880 1715-020202",
            distanceKm = 3.8
        ),
        Shelter(
            id = "SH-03",
            name = "Sunamganj Haor Relief Centre",
            banglaName = "সুনামগঞ্জ হাওর বন্যা আশ্রয় শিবির",
            district = "Sunamganj",
            latitude = 25.0710,
            longitude = 91.3980,
            totalCapacity = 1000,
            currentOccupancy = 980,
            status = ShelterStatus.FILLING_FAST,
            hasFoodSupply = true,
            hasCleanWater = false,
            hasMedicalFirstAid = true,
            hasPowerGenerator = false,
            hasBoatDock = true,
            contactPhone = "+880 1622-030303",
            distanceKm = 5.2
        ),
        Shelter(
            id = "SH-04",
            name = "Patharghata High School Cyclone Shelter",
            banglaName = "পাথরঘাটা বহুমুখী সাইক্লোন সেন্টার",
            district = "Barguna",
            latitude = 22.0250,
            longitude = 90.0510,
            totalCapacity = 800,
            currentOccupancy = 800,
            status = ShelterStatus.FULL,
            hasFoodSupply = false,
            hasCleanWater = true,
            hasMedicalFirstAid = true,
            hasPowerGenerator = true,
            hasBoatDock = false,
            contactPhone = "+880 1933-040404",
            distanceKm = 8.1
        ),
        Shelter(
            id = "SH-05",
            name = "Sylhet MC College Disaster Haven",
            banglaName = "সিলেট এমসি কলেজ দুর্যোগ আশ্রয়কেন্দ্র",
            district = "Sylhet",
            latitude = 24.8980,
            longitude = 91.8920,
            totalCapacity = 2000,
            currentOccupancy = 650,
            status = ShelterStatus.AVAILABLE,
            hasFoodSupply = true,
            hasCleanWater = true,
            hasMedicalFirstAid = true,
            hasPowerGenerator = true,
            hasBoatDock = false,
            contactPhone = "+880 1788-050505",
            distanceKm = 2.1
        )
    )

    private fun getInitialHospitals(): List<Hospital> = listOf(
        Hospital(
            id = "HOSP-01",
            name = "Dhaka Medical College & Hospital (DMCH)",
            banglaName = "ঢাকা মেডিকেল কলেজ হাসপাতাল",
            district = "Dhaka",
            latitude = 23.7258,
            longitude = 90.3976,
            availableIcuBeds = 14,
            availableErBeds = 42,
            ambulanceFleetCount = 18,
            bloodBankUnits = mapOf("O+" to 28, "A+" to 22, "B+" to 35, "AB+" to 12, "O-" to 6),
            contactPhone = "+880 2-55165001",
            distanceKm = 1.9
        ),
        Hospital(
            id = "HOSP-02",
            name = "Chittagong Medical College Hospital (CMCH)",
            banglaName = "চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল",
            district = "Chattogram",
            latitude = 22.3587,
            longitude = 91.8288,
            availableIcuBeds = 9,
            availableErBeds = 26,
            ambulanceFleetCount = 12,
            bloodBankUnits = mapOf("O+" to 18, "A+" to 15, "B+" to 20, "AB+" to 7, "O-" to 3),
            contactPhone = "+880 31-616382",
            distanceKm = 4.2
        ),
        Hospital(
            id = "HOSP-03",
            name = "Cox's Bazar 250 Bed District Sadar Hospital",
            banglaName = "কক্সবাজার জেলা সদর হাসপাতাল",
            district = "Cox's Bazar",
            latitude = 21.4390,
            longitude = 91.9750,
            availableIcuBeds = 6,
            availableErBeds = 19,
            ambulanceFleetCount = 8,
            bloodBankUnits = mapOf("O+" to 12, "A+" to 9, "B+" to 14, "AB+" to 4, "O-" to 2),
            contactPhone = "+880 341-63852",
            distanceKm = 2.7
        ),
        Hospital(
            id = "HOSP-04",
            name = "Sylhet MAG Osmani Medical College Hospital",
            banglaName = "সিলেট এমএজি ওসমানী মেডিকেল কলেজ হাসপাতাল",
            district = "Sylhet",
            latitude = 24.8960,
            longitude = 91.8610,
            availableIcuBeds = 11,
            availableErBeds = 34,
            ambulanceFleetCount = 10,
            bloodBankUnits = mapOf("O+" to 24, "A+" to 16, "B+" to 22, "AB+" to 9, "O-" to 5),
            contactPhone = "+880 821-713667",
            distanceKm = 3.5
        )
    )

    private fun getInitialDisasterAlerts(): List<DisasterAlert> = listOf(
        DisasterAlert(
            id = "WARN-2026-09",
            title = "Severe Cyclone 'Moni' - Great Danger Signal 10",
            banglaTitle = "তীব্র ঘূর্ণিঝড় 'মনি' - মহাবিপদ সংকেত ১০",
            signalLevel = "Signal 10 (Great Danger)",
            affectedRegions = listOf("Cox's Bazar", "Chattogram", "Noakhali", "Bhola", "Barguna"),
            severity = Severity.CRITICAL,
            description = "Severe cyclonic storm 'Moni' over Bay of Bengal is heading toward coastal Bangladesh with gusts up to 140 km/h and tidal surges 8-12 feet above normal.",
            banglaDescription = "বঙ্গোপসাগরে সৃষ্ট তীব্র ঘূর্ণিঝড় 'মনি' সর্বোচ্চ ১৪০ কিমি বেগে উপকূলের দিকে ধাবিত হচ্ছে। উপকূলীয় এলাকায় স্বাভাবিকের চেয়ে ৮-১২ ফুট উচ্চতার জলোচ্ছ্বাসের আশঙ্কা রয়েছে।",
            issuedAt = "Today, 11:30 AM (BMD Bulletin 14)",
            safetyDirective = "All maritime vessels must remain anchored. Immediate evacuation of coastal chars to cyclone shelters is mandatory.",
            banglaSafetyDirective = "সকল মাছ ধরার নৌকা অবিলম্বে নিরাপদ আশ্রয়ে থাকতে বলা হয়েছে। উপকূলীয় চরাঞ্চলের মানুষদের অবিলম্বে সাইক্লোন শেল্টারে আশ্রয় নিতে হবে।"
        )
    )

    private fun getInitialMeshNodes(): List<MeshRelayNode> = listOf(
        MeshRelayNode("NODE-01", "Citizen Node (You)", "Local Origin", 0, 84, true, -42),
        MeshRelayNode("NODE-02", "Volunteer Kazi (Boat #2)", "BLE Mesh Hop 1", 85, 76, true, -68),
        MeshRelayNode("NODE-03", "Coast Guard Relay Buoy", "BLE Mesh Hop 2", 240, 92, true, -74),
        MeshRelayNode("NODE-04", "Red Crescent Mobile Tower", "Gateway to Internet/SMS", 490, 89, true, -81, isGateway = true)
    )

    private fun getInitialChatMessages(): List<ChatMessage> = listOf(
        ChatMessage(
            id = "1",
            isUser = false,
            textEnglish = "Welcome to SafeBangla AI Crisis Assistant. I am trained on Bangladesh Disaster Management protocols (CPP, Red Crescent, Fire Service). Ask me for emergency guides, shelter navigation, flood purification, or snakebite first-aid.",
            textBangla = "সেফবাংলা এআই ক্রাইসিস অ্যাসিস্ট্যান্টে স্বাগতম। আমি বাংলাদেশের জাতীয় দুর্যোগ ব্যবস্থাপনা প্রটোকল অনুযায়ী তাৎক্ষণিক প্রাথমিক চিকিৎসা, সাইক্লোন সংকেতের অর্থ এবং আশ্রয়কেন্দ্রের তথ্য দিতে প্রস্তুত।"
        )
    )

    private fun getInitialDroneFleet(): List<DroneUnit> = listOf(
        DroneUnit(
            id = "DRONE-DELTA-01",
            callsign = "Meghna Eagle 1",
            type = DroneType.AERIAL_SUPPLY_HEXACOPTER,
            status = DroneStatus.DELIVERING_PAYLOAD,
            batteryPct = 82,
            currentAltitudeMeters = 85,
            speedKmh = 54,
            payloadDescription = "Anti-Venom Vials & 20x Halazone Water Purification Tablets",
            payloadKg = 8.5,
            latitude = 21.4310,
            longitude = 91.9740,
            destinationZone = "Cox's Bazar Coastal Union 4 (SOS-8491)",
            telemetryDbm = -54
        ),
        DroneUnit(
            id = "ROBOT-AMPHIB-02",
            callsign = "Haor Rover 02",
            type = DroneType.AMPHIBIOUS_RESCUE_ROBOT,
            status = DroneStatus.PATROLLING,
            batteryPct = 91,
            currentAltitudeMeters = 0,
            speedKmh = 18,
            payloadDescription = "Emergency Inflatable Lifebuoys & Satellite Transponder",
            payloadKg = 15.0,
            latitude = 25.0680,
            longitude = 91.4020,
            destinationZone = "Tahirpur Haor Basin Sector B",
            telemetryDbm = -62
        ),
        DroneUnit(
            id = "DRONE-MED-03",
            callsign = "Surma Lifeline",
            type = DroneType.MEDICAL_AIRDROP_UAV,
            status = DroneStatus.STANDBY,
            batteryPct = 100,
            currentAltitudeMeters = 0,
            speedKmh = 0,
            payloadDescription = "Trauma Bandages, ORS Sachets & Blood O- Bags",
            payloadKg = 4.2,
            latitude = 24.8980,
            longitude = 91.8900,
            destinationZone = "Relief Station Sylhet Airbase",
            telemetryDbm = -40
        )
    )

    private fun getInitialHazardReports(): List<HazardReport> = listOf(
        HazardReport(
            id = "HAZ-101",
            category = HazardCategory.FALLEN_ELECTRIC_WIRE,
            title = "Live Fallen High-Voltage Wire in Flooded Alley",
            banglaTitle = "পানিতে নিমজ্জিত জীবন্ত হাইভোল্টেজ বৈদ্যুতিক তার",
            locationName = "Near Anwara Pilot High School",
            latitude = 22.2160,
            longitude = 91.9130,
            timestamp = System.currentTimeMillis() - 1000 * 60 * 25,
            upvotes = 18,
            downvotes = 1,
            isVerifiedByAuthority = true,
            reporterName = "Tanvir Rahman",
            urgency = Severity.CRITICAL
        ),
        HazardReport(
            id = "HAZ-102",
            category = HazardCategory.EMBANKMENT_BREACH,
            title = "Coastal WDB Polder 43 Embankment Overflow",
            banglaTitle = "উপকূলীয় পোল্ডার ৪৩ এর বাঁধে তীব্র ভাঙন",
            locationName = "Patharghata Union 2",
            latitude = 22.0230,
            longitude = 90.0480,
            timestamp = System.currentTimeMillis() - 1000 * 60 * 50,
            upvotes = 24,
            downvotes = 0,
            isVerifiedByAuthority = true,
            reporterName = "Shafiqul Coastal Watch",
            urgency = Severity.CRITICAL
        ),
        HazardReport(
            id = "HAZ-103",
            category = HazardCategory.BRIDGE_COLLAPSED,
            title = "Wooden Connecting Bridge Washed Away by Flash Flood",
            banglaTitle = "হাওরের কাঠের সেতু ভেসে গিয়ে যোগাযোগ বিচ্ছিন্ন",
            locationName = "Tahirpur Road Kilometre 4",
            latitude = 25.0710,
            longitude = 91.3990,
            timestamp = System.currentTimeMillis() - 1000 * 60 * 110,
            upvotes = 9,
            downvotes = 2,
            isVerifiedByAuthority = false,
            reporterName = "Joynal Abedin",
            urgency = Severity.HIGH
        )
    )

    private fun getInitialWaterSensors(): List<WaterLevelSensor> = listOf(
        WaterLevelSensor(
            id = "SENSOR-BWDB-01",
            stationName = "Sunamganj Point",
            banglaStationName = "সুনামগঞ্জ পয়েন্ট",
            riverName = "Surma River (সুরমা নদী)",
            district = "Sunamganj",
            currentLevelMeters = 8.65,
            dangerLevelMeters = 8.00,
            rateOfRiseCmHr = 14.5,
            trend = WaterTrend.RISING_RAPIDLY,
            isTriggeringAlarm = true,
            lastWebhookPing = "2 mins ago (MQTT/HTTP Webhook)"
        ),
        WaterLevelSensor(
            id = "SENSOR-BWDB-02",
            stationName = "Sarighat Point",
            banglaStationName = "সারীঘাট পয়েন্ট",
            riverName = "Sari-Gowain River",
            district = "Sylhet",
            currentLevelMeters = 12.30,
            dangerLevelMeters = 12.80,
            rateOfRiseCmHr = 6.2,
            trend = WaterTrend.RISING_RAPIDLY,
            isTriggeringAlarm = false,
            lastWebhookPing = "5 mins ago"
        ),
        WaterLevelSensor(
            id = "SENSOR-BWDB-03",
            stationName = "Kalurghat Gauge",
            banglaStationName = "কালুরঘাট গেজ",
            riverName = "Karnaphuli River (কর্ণফুলী)",
            district = "Chattogram",
            currentLevelMeters = 4.10,
            dangerLevelMeters = 3.80,
            rateOfRiseCmHr = 18.0,
            trend = WaterTrend.RISING_RAPIDLY,
            isTriggeringAlarm = true,
            lastWebhookPing = "1 min ago"
        )
    )

    // === Family Safety Circle Methods ===
    fun broadcastIamSafe(citizenName: String) {
        _familyMembers.update { members ->
            members.map { m ->
                if (m.relationship == "You") {
                    m.copy(isSafe = true, lastCheckIn = "Just Now")
                } else m
            }
        }
    }

    fun toggleFamilyMemberSafety(memberId: String) {
        _familyMembers.update { members ->
            members.map { m ->
                if (m.id == memberId) {
                    m.copy(
                        isSafe = !m.isSafe,
                        lastCheckIn = "Just Now"
                    )
                } else m
            }
        }
    }

    // === Digital Shelter Virtual Queue & Smart Load Balancer ===
    fun requestSmartShelterToken(targetShelterId: String, citizenName: String): ShelterToken {
        val allShelters = _shelters.value
        val targetShelter = allShelters.firstOrNull { it.id == targetShelterId } ?: allShelters.first()

        val occupancyRatio = targetShelter.currentOccupancy.toDouble() / targetShelter.totalCapacity.toDouble()
        val isOverloaded = occupancyRatio >= 0.90 // 90% load threshold

        val token: ShelterToken
        if (isOverloaded) {
            // Find nearest alternate shelter with capacity < 85%
            val alternateShelter = allShelters.firstOrNull {
                it.id != targetShelterId && (it.currentOccupancy.toDouble() / it.totalCapacity.toDouble()) < 0.85
            } ?: targetShelter

            updateShelterOccupancy(alternateShelter.id, 1)

            token = ShelterToken(
                tokenId = "TKN-${UUID.randomUUID().toString().take(6).uppercase()}",
                shelterId = alternateShelter.id,
                shelterName = alternateShelter.name,
                citizenName = citizenName.ifBlank { "Citizen Visitor" },
                tokenQrCode = "SAFEBANGLA-TOKEN-${alternateShelter.id}-${UUID.randomUUID().toString().take(8)}",
                allottedZone = "Zone B - Rerouted Haven",
                queueNumber = alternateShelter.currentOccupancy + 1,
                issuedAt = "Just Now",
                isRedirectedDueToLoad = true,
                redirectReason = "Target shelter (${targetShelter.name}) reached 90% critical capacity. Smart Load Balancer auto-routed you to ${alternateShelter.name} (${alternateShelter.distanceKm} km away).",
                originalShelterName = targetShelter.name
            )
        } else {
            updateShelterOccupancy(targetShelter.id, 1)

            token = ShelterToken(
                tokenId = "TKN-${UUID.randomUUID().toString().take(6).uppercase()}",
                shelterId = targetShelter.id,
                shelterName = targetShelter.name,
                citizenName = citizenName.ifBlank { "Citizen Visitor" },
                tokenQrCode = "SAFEBANGLA-TOKEN-${targetShelter.id}-${UUID.randomUUID().toString().take(8)}",
                allottedZone = "Zone A - Primary Deck",
                queueNumber = targetShelter.currentOccupancy + 1,
                issuedAt = "Just Now",
                isRedirectedDueToLoad = false
            )
        }

        _shelterTokens.update { listOf(token) + it }
        return token
    }

    // === AI Ambient Panic Audio Logging ===
    fun logAmbientAudioDetection(
        soundType: String,
        confidencePct: Int,
        decibelLevel: Int,
        urgency: Severity,
        autoTriggered: Boolean
    ): AmbientAudioDetection {
        val detection = AmbientAudioDetection(
            id = "DET-${UUID.randomUUID().toString().take(6).uppercase()}",
            detectedAt = "Just Now",
            soundType = soundType,
            confidencePct = confidencePct,
            decibelLevel = decibelLevel,
            threatLevel = urgency,
            autoTriggeredSos = autoTriggered
        )
        _ambientAudioLogs.update { listOf(detection) + it }
        return detection
    }

    private fun getInitialFamilyMembers(): List<FamilyMember> = listOf(
        FamilyMember("FAM-01", "Tanvir Rahman", "You", "+880 1819-234567", 21.4300, 91.9720, true, 84, "Active Now", 0.0, "O+"),
        FamilyMember("FAM-02", "Amina Begum", "Mother", "+880 1712-445566", 21.4285, 91.9750, false, 32, "8 mins ago", 0.4, "A+"),
        FamilyMember("FAM-03", "Kazi Farhan", "Brother", "+880 1823-778899", 21.4380, 91.9680, true, 68, "2 mins ago", 1.2, "O+"),
        FamilyMember("FAM-04", "Nusrat Jahan", "Sister", "+880 1914-112233", 21.4250, 91.9820, false, 14, "15 mins ago", 1.6, "B+")
    )

    private fun getInitialLeaderboard(): List<VolunteerLeaderboardEntry> = listOf(
        VolunteerLeaderboardEntry(1, "VOL-09", "Kazi Rayhan", "Chattogram Delta Corps", 4850, 24, 78.5, "Community Hero", isCurrentUser = true),
        VolunteerLeaderboardEntry(2, "VOL-04", "Farhana Sultana", "Sylhet Haor Rescuers", 4420, 21, 69.0, "Haor Pilot"),
        VolunteerLeaderboardEntry(3, "VOL-12", "Mohammad Belal", "Cox's Bazar Coast Guard Aux", 3980, 19, 62.0, "Delta Guardian"),
        VolunteerLeaderboardEntry(4, "VOL-07", "Tanima Akhter", "Barishal Flood Response", 3450, 16, 54.5, "First Responder"),
        VolunteerLeaderboardEntry(5, "VOL-18", "Robiul Islam", "Dhaka Urban Disaster Unit", 2980, 13, 44.0, "Lifesaver")
    )

    private fun getInitialAudioDetections(): List<AmbientAudioDetection> = listOf(
        AmbientAudioDetection("DET-01", "3 mins ago", "Human Distress Cry / Scream", 94, 88, Severity.CRITICAL, autoTriggeredSos = true),
        AmbientAudioDetection("DET-02", "14 mins ago", "Violent Surge / Rushing Water", 89, 82, Severity.HIGH, autoTriggeredSos = false),
        AmbientAudioDetection("DET-03", "45 mins ago", "Explosion / Structural Collapse", 96, 102, Severity.CRITICAL, autoTriggeredSos = true)
    )
}
