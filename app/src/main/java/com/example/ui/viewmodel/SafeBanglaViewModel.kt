package com.example.ui.viewmodel

import android.app.Application
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.*
import com.example.data.repository.SafeBanglaRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlin.random.Random

class SafeBanglaViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = SafeBanglaRepository()

    private val _currentRole = MutableStateFlow(UserRole.CITIZEN)
    val currentRole: StateFlow<UserRole> = _currentRole.asStateFlow()

    private val _language = MutableStateFlow(Language.ENGLISH)
    val language: StateFlow<Language> = _language.asStateFlow()

    private val _isBlackoutMode = MutableStateFlow(false)
    val isBlackoutMode: StateFlow<Boolean> = _isBlackoutMode.asStateFlow()

    private val _selectedTab = MutableStateFlow(0)
    val selectedTab: StateFlow<Int> = _selectedTab.asStateFlow()

    // Ultra-Accessible Hardened One-Tap Interface Mode
    private val _isEasyAccessibleMode = MutableStateFlow(false)
    val isEasyAccessibleMode: StateFlow<Boolean> = _isEasyAccessibleMode.asStateFlow()

    // Guided Voice-Over Onboarding Tutorial
    private val _showVoiceTutorial = MutableStateFlow(false)
    val showVoiceTutorial: StateFlow<Boolean> = _showVoiceTutorial.asStateFlow()

    // Hardware Triple-Press SOS Shortcut State
    private val _isHardwareShortcutArmed = MutableStateFlow(true)
    val isHardwareShortcutArmed: StateFlow<Boolean> = _isHardwareShortcutArmed.asStateFlow()

    private val _hardwareSosTriggeredNotice = MutableStateFlow<String?>(null)
    val hardwareSosTriggeredNotice: StateFlow<String?> = _hardwareSosTriggeredNotice.asStateFlow()

    // Offline Compass Azimuth
    private val _compassAzimuth = MutableStateFlow(42f)
    val compassAzimuth: StateFlow<Float> = _compassAzimuth.asStateFlow()

    private val _activeSos = MutableStateFlow<SosAlert?>(null)
    val activeSos: StateFlow<SosAlert?> = _activeSos.asStateFlow()

    private val _isRecordingAudio = MutableStateFlow(false)
    val isRecordingAudio: StateFlow<Boolean> = _isRecordingAudio.asStateFlow()

    private val _recordingSecondsLeft = MutableStateFlow(10)
    val recordingSecondsLeft: StateFlow<Int> = _recordingSecondsLeft.asStateFlow()

    private val _isPanicListening = MutableStateFlow(false)
    val isPanicListening: StateFlow<Boolean> = _isPanicListening.asStateFlow()

    private val _ambientDecibels = MutableStateFlow(42f)
    val ambientDecibels: StateFlow<Float> = _ambientDecibels.asStateFlow()

    private val _screamDetected = MutableStateFlow(false)
    val screamDetected: StateFlow<Boolean> = _screamDetected.asStateFlow()

    private val _ambulanceDispatchModal = MutableStateFlow<Hospital?>(null)
    val ambulanceDispatchModal: StateFlow<Hospital?> = _ambulanceDispatchModal.asStateFlow()

    private val _ambulanceSuccessStatus = MutableStateFlow<String?>(null)
    val ambulanceSuccessStatus: StateFlow<String?> = _ambulanceSuccessStatus.asStateFlow()

    private val _showTechSpecs = MutableStateFlow(false)
    val showTechSpecs: StateFlow<Boolean> = _showTechSpecs.asStateFlow()

    // Flows from repository
    val sosAlerts = repository.sosAlerts
    val shelters = repository.shelters
    val hospitals = repository.hospitals
    val disasterAlerts = repository.disasterAlerts
    val volunteerProfile = repository.volunteerProfile
    val meshNodes = repository.meshNodes
    val chatMessages = repository.chatMessages
    val droneFleet = repository.droneFleet
    val hazardReports = repository.hazardReports
    val waterSensors = repository.waterSensors
    val familyMembers = repository.familyMembers
    val shelterTokens = repository.shelterTokens
    val volunteerLeaderboard = repository.volunteerLeaderboard
    val ambientAudioLogs = repository.ambientAudioLogs

    private val _isShakeDetectionArmed = MutableStateFlow(true)
    val isShakeDetectionArmed: StateFlow<Boolean> = _isShakeDetectionArmed.asStateFlow()

    private val _latestIssuedToken = MutableStateFlow<ShelterToken?>(null)
    val latestIssuedToken: StateFlow<ShelterToken?> = _latestIssuedToken.asStateFlow()

    private val _covertShakeTriggerNotice = MutableStateFlow<String?>(null)
    val covertShakeTriggerNotice: StateFlow<String?> = _covertShakeTriggerNotice.asStateFlow()

    private var panicAudioJob: Job? = null
    private var recordingJob: Job? = null

    init {
        // Compass simulation loop for offline navigation
        viewModelScope.launch {
            while (true) {
                delay(600)
                _compassAzimuth.update { (it + 1.2f) % 360f }
            }
        }
    }

    fun setRole(role: UserRole) {
        _currentRole.value = role
    }

    fun toggleLanguage() {
        _language.update { if (it == Language.ENGLISH) Language.BANGLA else Language.ENGLISH }
    }

    fun setTab(index: Int) {
        _selectedTab.value = index
    }

    fun toggleBlackoutMode() {
        _isBlackoutMode.update { !it }
    }

    fun toggleEasyAccessibleMode() {
        _isEasyAccessibleMode.update { !it }
    }

    fun setShowVoiceTutorial(show: Boolean) {
        _showVoiceTutorial.value = show
    }

    // Hardware Triple-Press Volume/Power SOS Simulator
    fun triggerHardwareSosShortcut() {
        vibratePhone(800)
        _hardwareSosTriggeredNotice.value = "HARDWARE SHORTCUT TRIGGERED! Triple-press on physical volume buttons detected. Emergency broadcast initiated automatically."
        triggerSos(
            notes = "Triggered via Hardware Button Triple-Press Shortcut (Zero-Screen Interaction)",
            isSilent = false
        )
        viewModelScope.launch {
            delay(5000)
            _hardwareSosTriggeredNotice.value = null
        }
    }

    fun triggerSos(
        name: String = "Citizen Tanvir",
        phone: String = "+880 1819-234567",
        type: DisasterType = DisasterType.CYCLONE,
        severity: Severity = Severity.CRITICAL,
        peopleCount: Int = 4,
        waterLevelCm: Int = 110,
        notes: String = "House surrounded by surge water, needs urgent evacuation boat",
        isSilent: Boolean = false
    ) {
        vibratePhone(500)
        val isOffline = _isBlackoutMode.value
        val alert = repository.triggerCitizenSos(
            name = name,
            phone = phone,
            latitude = 21.4300,
            longitude = 91.9720,
            locationName = "Cox's Bazar Coastal Ward 5",
            division = "Chattogram",
            type = type,
            severity = severity,
            peopleCount = peopleCount,
            waterLevelCm = waterLevelCm,
            notes = notes,
            isSilent = isSilent,
            isOfflineSms = isOffline,
            isBleRelayed = isOffline
        )
        _activeSos.value = alert
        start10SecondAudioCapture()
    }

    private fun start10SecondAudioCapture() {
        recordingJob?.cancel()
        _isRecordingAudio.value = true
        _recordingSecondsLeft.value = 10
        recordingJob = viewModelScope.launch {
            for (sec in 10 downTo 1) {
                _recordingSecondsLeft.value = sec
                delay(1000)
            }
            _isRecordingAudio.value = false
        }
    }

    fun cancelActiveSos() {
        _activeSos.value = null
        _isRecordingAudio.value = false
        recordingJob?.cancel()
    }

    fun togglePanicListening() {
        val willListen = !_isPanicListening.value
        _isPanicListening.value = willListen
        _screamDetected.value = false

        panicAudioJob?.cancel()
        if (willListen) {
            panicAudioJob = viewModelScope.launch {
                while (_isPanicListening.value) {
                    delay(300)
                    val randomDb = if (Random.nextInt(100) > 92) {
                        Random.nextInt(85, 105).toFloat()
                    } else {
                        Random.nextInt(38, 58).toFloat()
                    }
                    _ambientDecibels.value = randomDb
                    if (randomDb >= 85f) {
                        _screamDetected.value = true
                        vibratePhone(300)
                    }
                }
            }
        }
    }

    fun dismissScreamAlert() {
        _screamDetected.value = false
    }

    // === Family Safety Circle Actions ===
    fun broadcastIamSafe() {
        vibratePhone(200)
        repository.broadcastIamSafe("Tanvir Rahman")
    }

    fun toggleFamilyMemberSafety(memberId: String) {
        vibratePhone(150)
        repository.toggleFamilyMemberSafety(memberId)
    }

    // === Digital Shelter Virtual Queue & Smart Load Balancer ===
    fun bookSmartShelterToken(shelterId: String, citizenName: String = "Tanvir Rahman") {
        vibratePhone(350)
        val token = repository.requestSmartShelterToken(shelterId, citizenName)
        _latestIssuedToken.value = token
    }

    fun dismissLatestToken() {
        _latestIssuedToken.value = null
    }

    // === Silent Pocket Gesture & Secret Hardware SOS ===
    fun triggerShakeSosGesture() {
        vibratePhone(600)
        _covertShakeTriggerNotice.value = "SECRET SHAKE SOS ACTIVATED! Rapid physical accelerometer shake detected. Silent geotagged emergency broadcast sent."
        triggerSos(
            notes = "Silent Covert SOS: Physical Accelerometer Rapid Shake in Pocket",
            isSilent = true
        )
        viewModelScope.launch {
            delay(5000)
            _covertShakeTriggerNotice.value = null
        }
    }

    fun toggleShakeDetectionArmed() {
        _isShakeDetectionArmed.update { !it }
    }

    // === AI Ambient Panic Audio Classification Simulation ===
    fun simulateAmbientPanicDetection(soundType: String, confidence: Int, decibels: Int) {
        val detection = repository.logAmbientAudioDetection(
            soundType = soundType,
            confidencePct = confidence,
            decibelLevel = decibels,
            urgency = Severity.CRITICAL,
            autoTriggered = true
        )
        _screamDetected.value = true
        vibratePhone(500)
    }

    // Drone Operations
    fun dispatchDroneToMission(droneId: String, zone: String) {
        repository.dispatchDroneToMission(droneId, zone)
        vibratePhone(250)
    }

    fun triggerDroneAirdrop(droneId: String) {
        repository.triggerAirdrop(droneId)
        vibratePhone(400)
    }

    // Hazard Reporting
    fun upvoteHazard(hazardId: String) {
        repository.upvoteHazard(hazardId)
        vibratePhone(150)
    }

    fun downvoteHazard(hazardId: String) {
        repository.downvoteHazard(hazardId)
    }

    fun submitHazardReport(
        category: HazardCategory,
        title: String,
        banglaTitle: String,
        location: String,
        urgency: Severity
    ) {
        repository.reportNewHazard(
            category = category,
            title = title,
            banglaTitle = banglaTitle,
            locationName = location,
            latitude = 21.4320,
            longitude = 91.9750,
            urgency = urgency
        )
        vibratePhone(300)
    }

    // IoT Sensor Alarm Trigger
    fun triggerWaterSensorAlarm(sensorId: String, riseMeters: Double) {
        repository.triggerSensorWebhookAlarm(sensorId, riseMeters)
        vibratePhone(500)
    }

    fun acceptMission(sosId: String) {
        val volName = volunteerProfile.value.name
        repository.acceptMission(sosId, volName)
        vibratePhone(200)
    }

    fun deployRescueUnit(sosId: String, unitType: String) {
        repository.deployRescueUnit(sosId, unitType)
        vibratePhone(300)
    }

    fun markResolved(sosId: String) {
        repository.markResolved(sosId)
    }

    fun updateShelterCapacity(shelterId: String, delta: Int) {
        repository.updateShelterOccupancy(shelterId, delta)
    }

    fun broadcastAdminAlert(
        title: String,
        banglaTitle: String,
        signalLevel: String,
        regions: List<String>,
        severity: Severity,
        desc: String,
        banglaDesc: String
    ) {
        val newAlert = DisasterAlert(
            id = "ADMIN-ALERT-${System.currentTimeMillis() % 10000}",
            title = title,
            banglaTitle = banglaTitle,
            signalLevel = signalLevel,
            affectedRegions = regions,
            severity = severity,
            description = desc,
            banglaDescription = banglaDesc,
            issuedAt = "Just Now by National Disaster Emergency Control",
            safetyDirective = "Seek immediate cyclone shelter and monitor official radio bulletins.",
            banglaSafetyDirective = "নিকটস্থ সাইক্লোন শেল্টারে আশ্রয় নিন এবং বেতার বার্তা অনুসরণ করুন।"
        )
        repository.broadcastNewAlert(newAlert)
        vibratePhone(600)
    }

    fun openAmbulanceModal(hospital: Hospital) {
        _ambulanceDispatchModal.value = hospital
        _ambulanceSuccessStatus.value = null
    }

    fun closeAmbulanceModal() {
        _ambulanceDispatchModal.value = null
        _ambulanceSuccessStatus.value = null
    }

    fun confirmAmbulanceDispatch(patientName: String, patientCondition: String) {
        val hospital = _ambulanceDispatchModal.value ?: return
        viewModelScope.launch {
            _ambulanceSuccessStatus.value = "Dispatching Rapid Response Ambulance from ${hospital.name}..."
            delay(1200)
            _ambulanceSuccessStatus.value = "DISPATCH CONFIRMED! Ambulance #BD-09 is en route. Driver: Kabir Hossain (+880 1711-229988). Estimated arrival: 14 mins. Real-time GPS beacon enabled."
            vibratePhone(400)
        }
    }

    fun sendChatMessage(text: String) {
        if (text.isBlank()) return
        val isBangla = _language.value == Language.BANGLA
        repository.sendChatMessage(text, isBangla)
    }

    fun triggerVoiceCommand(commandType: String) {
        when (commandType) {
            "SOS_BANGLA" -> {
                triggerSos(notes = "Triggered via Voice Command: 'আমার সাহায্য লাগবে' (Immediate Distress)")
            }
            "SHELTER_BANGLA" -> {
                _selectedTab.value = 1
            }
            "AMBULANCE_BANGLA" -> {
                _selectedTab.value = 2
            }
            "HAZARD_BANGLA" -> {
                _selectedTab.value = 5 // Hazards
            }
            "DRONE_BANGLA" -> {
                _selectedTab.value = 6 // Drones
            }
        }
    }

    fun openDialer(phoneNumber: String) {
        val intent = Intent(Intent.ACTION_DIAL).apply {
            data = Uri.parse("tel:${phoneNumber.replace(" ", "")}")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        getApplication<Application>().startActivity(intent)
    }

    fun openNavigationMap(lat: Double, lng: Double, label: String) {
        val uri = Uri.parse("geo:$lat,$lng?q=$lat,$lng($label)")
        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        try {
            getApplication<Application>().startActivity(intent)
        } catch (_: Exception) {
            val webUri = Uri.parse("https://www.google.com/maps/search/?api=1&query=$lat,$lng")
            val webIntent = Intent(Intent.ACTION_VIEW, webUri).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            getApplication<Application>().startActivity(webIntent)
        }
    }

    fun sendOfflineSmsSos(phone: String, payload: String) {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("smsto:$phone")
            putExtra("sms_body", payload)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        try {
            getApplication<Application>().startActivity(intent)
        } catch (_: Exception) {
            // Fallback
        }
    }

    fun toggleTechSpecsDialog(show: Boolean) {
        _showTechSpecs.value = show
    }

    private fun vibratePhone(durationMs: Long) {
        val vibrator = getApplication<Application>().getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        if (vibrator != null && vibrator.hasVibrator()) {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(durationMs)
            }
        }
    }
}
