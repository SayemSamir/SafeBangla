package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.*
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

@Composable
fun CitizenScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val isBlackout by viewModel.isBlackoutMode.collectAsState()
    val isEasyMode by viewModel.isEasyAccessibleMode.collectAsState()
    val isShakeArmed by viewModel.isShakeDetectionArmed.collectAsState()
    val activeSos by viewModel.activeSos.collectAsState()
    val isRecording by viewModel.isRecordingAudio.collectAsState()
    val secondsLeft by viewModel.recordingSecondsLeft.collectAsState()
    val isPanicListening by viewModel.isPanicListening.collectAsState()
    val ambientDb by viewModel.ambientDecibels.collectAsState()
    val screamDetected by viewModel.screamDetected.collectAsState()
    val disasterAlerts by viewModel.disasterAlerts.collectAsState()
    val shelters by viewModel.shelters.collectAsState()
    val sosAlerts by viewModel.sosAlerts.collectAsState()
    val compassAzimuth by viewModel.compassAzimuth.collectAsState()
    val hardwareNotice by viewModel.hardwareSosTriggeredNotice.collectAsState()
    val showVoiceTutorial by viewModel.showVoiceTutorial.collectAsState()

    var showOfflineSmsModal by remember { mutableStateOf(false) }

    // If citizen toggled the Hardened One-Tap Large Icon interface, render EasyAccessibleSosScreen
    if (isEasyMode) {
        EasyAccessibleSosScreen(viewModel = viewModel, modifier = modifier)
        return
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(SlateDark)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hardware Triple-Press Notice Bar
        if (hardwareNotice != null) {
            item {
                Surface(
                    color = EmergencyRed,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.TouchApp, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = hardwareNotice!!, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Active Disaster Broadcast Alert Banner
        item {
            disasterAlerts.firstOrNull()?.let { alert ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = EmergencyRedDark),
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, EmergencyRedGlow),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("cyclone_warning_banner")
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Campaign, contentDescription = null, tint = WarningYellow)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = alert.signalLevel,
                                    color = WarningYellow,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                            Text(
                                text = alert.issuedAt.take(15),
                                color = SlateLight,
                                fontSize = 10.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (language == Language.BANGLA) alert.banglaTitle else alert.title,
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (language == Language.BANGLA) alert.banglaSafetyDirective else alert.safetyDirective,
                            color = SlateLight,
                            fontSize = 11.sp,
                            lineHeight = 15.sp
                        )
                    }
                }
            }
        }

        // Active SOS Broadcast Card if Citizen has triggered SOS
        item {
            AnimatedVisibility(
                visible = activeSos != null,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                activeSos?.let { sos ->
                    ActiveSosStatusCard(
                        alert = sos,
                        isRecording = isRecording,
                        secondsLeft = secondsLeft,
                        onCancel = { viewModel.cancelActiveSos() }
                    )
                }
            }
        }

        // Primary One-Tap & Hold SOS Button
        item {
            SosButtonWidget(
                isBlackout = isBlackout,
                language = language,
                onTriggerSos = { type, severity, count, water, notes, silent ->
                    viewModel.triggerSos(
                        type = type,
                        severity = severity,
                        peopleCount = count,
                        waterLevelCm = water,
                        notes = notes,
                        isSilent = silent
                    )
                }
            )
        }

        // Accessibility & Guided Voice Quick Action Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilledTonalButton(
                    onClick = { viewModel.toggleEasyAccessibleMode() },
                    colors = ButtonDefaults.filledTonalButtonColors(containerColor = SlateCardElevated),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.AccessibilityNew, contentDescription = null, modifier = Modifier.size(16.dp), tint = WarningYellow)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (language == Language.BANGLA) "সহজ ১-ট্যাপ মোড" else "Easy 1-Tap Mode",
                        fontSize = 11.sp,
                        color = Color.White
                    )
                }

                FilledTonalButton(
                    onClick = { viewModel.setShowVoiceTutorial(true) },
                    colors = ButtonDefaults.filledTonalButtonColors(containerColor = SlateCardElevated),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.RecordVoiceOver, contentDescription = null, modifier = Modifier.size(16.dp), tint = SafetyCyan)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (language == Language.BANGLA) "অডিও নির্দেশিকা" else "Voice Tutorial",
                        fontSize = 11.sp,
                        color = Color.White
                    )
                }
            }
        }

        // Hardware Triple-Press Physical Button SOS Simulator Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                        Icon(Icons.Default.TouchApp, contentDescription = null, tint = WarningYellow, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = if (language == Language.BANGLA) "হার্ডওয়্যার বাটন শর্টকাট সক্রিয়" else "Hardware Button SOS Shortcut",
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = if (language == Language.BANGLA) "স্ক্রিন বন্ধ রেখেই ভলিউম বাটন ৩ বার চাপলে এসওএস যাবে" else "Triple-press Volume Down to trigger covert SOS in pocket",
                                color = SlateMuted,
                                fontSize = 10.sp
                            )
                        }
                    }

                    Button(
                        onClick = { viewModel.triggerHardwareSosShortcut() },
                        colors = ButtonDefaults.buttonColors(containerColor = EmergencyRedDark),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text("Test Key", fontSize = 10.sp, color = Color.White)
                    }
                }
            }
        }

        // Silent Pocket Gesture & Accelerometer Shake Listener Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (isShakeArmed) SafetyCyan.copy(alpha = 0.5f) else SlateBorder
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(Icons.Default.Vibration, contentDescription = null, tint = SafetyCyan, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = if (language == Language.BANGLA) "পকেট শেক ডিটেকশন (গোপন এসওএস)" else "Pocket Shake Detector (Covert SOS)",
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = if (language == Language.BANGLA) "ফোন ৩ বার দ্রুত ঝাঁকালে নিঃশব্দে এসওএস সম্প্রচার হবে" else "Rapid physical phone shake triggers silent GPS & audio SOS",
                                    color = SlateMuted,
                                    fontSize = 10.sp
                                )
                            }
                        }
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Switch(
                                checked = isShakeArmed,
                                onCheckedChange = { viewModel.toggleShakeDetectionArmed() },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = SafetyCyan,
                                    checkedTrackColor = SafetyCyan.copy(alpha = 0.3f)
                                ),
                                modifier = Modifier.scale(0.8f)
                            )
                            Button(
                                onClick = { viewModel.triggerShakeSosGesture() },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1)),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text("Shake", fontSize = 10.sp, color = Color.White)
                            }
                        }
                    }
                }
            }
        }

        // AI Ambient Panic Audio & Cry Fingerprint Listener
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (screamDetected) EmergencyRed else SlateBorder
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(
                                Icons.Default.Hearing,
                                contentDescription = null,
                                tint = if (screamDetected) EmergencyRed else SafetyCyan,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "AI Ambient Audio & Cry Classifier",
                                        color = Color.White,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        "${ambientDb.toInt()} dB",
                                        color = if (ambientDb > 85) EmergencyRed else Color(0xFF10B981),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Text(
                                    text = if (screamDetected) "⚠️ DISTRESS SCREAM DETECTED (Confidence: 94%)" else "Monitoring for screams, rushing water, and explosion blasts",
                                    color = if (screamDetected) EmergencyRed else SlateMuted,
                                    fontSize = 10.sp
                                )
                            }
                        }
                        Button(
                            onClick = {
                                viewModel.simulateAmbientPanicDetection("Distress Screams & Rapid Water", 94, 91)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = EmergencyRedDark),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text("Simulate Cry", fontSize = 10.sp, color = Color.White)
                        }
                    }
                }
            }
        }

        // 100% Offline Compass Bearing to Pre-Cached Shelters
        item {
            OfflineCompassCard(
                azimuth = compassAzimuth,
                targetShelter = shelters.firstOrNull(),
                language = language
            )
        }

        // Offline SMS Fallback Banner
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (isBlackout) WarningYellow else SlateBorder
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { showOfflineSmsModal = true }
                    .testTag("offline_sms_card")
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(if (isBlackout) WarningYellow.copy(alpha = 0.2f) else SlateCardElevated),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Sms,
                            contentDescription = null,
                            tint = if (isBlackout) WarningYellow else SafetyCyan
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (language == Language.BANGLA) "অফলাইন এসএমএস ব্যাকআপ মোড" else "Offline SOS SMS Fallback",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (language == Language.BANGLA) "নেটওয়ার্ক না থাকলে স্বয়ংক্রিয় জিপিএস কোঅর্ডিনেট এসএমএস" else "Geotagged compressed SMS directly to 999/109 gateway",
                            color = SlateMuted,
                            fontSize = 11.sp
                        )
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = SlateMuted)
                }
            }
        }

        // Panic Audio Fingerprinting Module
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (screamDetected) EmergencyRed else SlateBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Hearing,
                                contentDescription = null,
                                tint = if (isPanicListening) SafetyCyan else SlateMuted,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (language == Language.BANGLA) "প্যানিক অডিও ডিটেকশন (স্মার্ট লিসনিং)" else "Panic Audio Fingerprinting",
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Switch(
                            checked = isPanicListening,
                            onCheckedChange = { viewModel.togglePanicListening() },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = SafetyCyan,
                                checkedTrackColor = SafetyTeal
                            )
                        )
                    }

                    if (isPanicListening) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "Ambient Decibel Meter: ${ambientDb.toInt()} dB",
                                color = if (ambientDb > 80f) EmergencyRedGlow else SafetyCyan,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = if (ambientDb > 80f) "CRITICAL SOUND SPIKE" else "Monitoring Screams & Blasts",
                                color = if (ambientDb > 80f) EmergencyRedGlow else SlateMuted,
                                fontSize = 10.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        LinearProgressIndicator(
                            progress = { (ambientDb / 120f).coerceIn(0f, 1f) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = if (ambientDb > 80f) EmergencyRed else SafetyCyan,
                            trackColor = SlateBorder
                        )

                        if (screamDetected) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Surface(
                                color = EmergencyRedDark,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "⚠️ High Distress Cry Detected!",
                                            color = Color.White,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Auto-suggest emergency broadcast dispatch",
                                            color = SlateLight,
                                            fontSize = 10.sp
                                        )
                                    }
                                    Button(
                                        onClick = {
                                            viewModel.triggerSos(notes = "Triggered by Panic Audio Scream Detection")
                                            viewModel.dismissScreamAlert()
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                    ) {
                                        Text("Confirm SOS", fontSize = 10.sp, color = Color.White)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Native Voice Commands (Bangla & English)
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.RecordVoiceOver, contentDescription = null, tint = SafetyCyan, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (language == Language.BANGLA) "বাংলা ভয়েস অ্যাক্টিভেটেড কমান্ড" else "Bangla Voice-Activated Commands",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = if (language == Language.BANGLA) "স্পিচ টু টেক্সট ও সরাসরি ভয়েস নির্দেশিকা:" else "Hands-free emergency voice triggers in local dialect:",
                        color = SlateMuted,
                        fontSize = 11.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        FilledTonalButton(
                            onClick = { viewModel.triggerVoiceCommand("SOS_BANGLA") },
                            colors = ButtonDefaults.filledTonalButtonColors(containerColor = EmergencyRedDark),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("🗣️ 'আমার সাহায্য লাগবে'", fontSize = 11.sp, color = Color.White)
                        }
                        FilledTonalButton(
                            onClick = { viewModel.triggerVoiceCommand("SHELTER_BANGLA") },
                            colors = ButtonDefaults.filledTonalButtonColors(containerColor = SlateCardElevated),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("🗣️ 'কাছের শেল্টার কোথায়?'", fontSize = 11.sp, color = Color.White)
                        }
                    }
                }
            }
        }

        // Interactive 5km Tactical Radar Map View
        item {
            RadarMapView(
                shelters = shelters,
                sosAlerts = sosAlerts,
                onSelectShelter = { viewModel.setTab(1) },
                onSelectSos = { /* handled */ }
            )
        }

        // National Emergency Hotlines Bar
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = if (language == Language.BANGLA) "জাতীয় জরুরি হটলাইন ডায়ালার" else "National Emergency Hotlines",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        HotlineButton("999", "National SOS", Icons.Default.Phone) { viewModel.openDialer("999") }
                        HotlineButton("16163", "Fire Service", Icons.Default.LocalFireDepartment) { viewModel.openDialer("16163") }
                        HotlineButton("109", "Disaster Helpline", Icons.Default.CrisisAlert) { viewModel.openDialer("109") }
                        HotlineButton("Coast Guard", "Maritime Rescue", Icons.Default.DirectionsBoat) { viewModel.openDialer("01766690033") }
                    }
                }
            }
        }
    }

    OfflineSmsDialog(
        isOpen = showOfflineSmsModal,
        language = language,
        onDismiss = { showOfflineSmsModal = false },
        onSendSms = { phone, payload -> viewModel.sendOfflineSmsSos(phone, payload) }
    )

    VoiceTutorialDialog(
        isOpen = showVoiceTutorial,
        language = language,
        onDismiss = { viewModel.setShowVoiceTutorial(false) }
    )
}

@Composable
private fun HotlineButton(
    number: String,
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(4.dp)
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(SlateCardElevated)
                .border(1.dp, SlateBorder, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = title, tint = SafetyCyan, modifier = Modifier.size(20.dp))
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = number, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        Text(text = title, color = SlateMuted, fontSize = 9.sp)
    }
}
