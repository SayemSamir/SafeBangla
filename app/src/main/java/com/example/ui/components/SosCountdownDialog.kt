package com.example.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.DisasterType
import com.example.data.model.Language
import com.example.data.model.Severity
import com.example.data.model.SosAlert
import com.example.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun SosButtonWidget(
    isBlackout: Boolean,
    language: Language,
    onTriggerSos: (DisasterType, Severity, Int, Int, String, Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    var isHolding by remember { mutableStateOf(false) }
    var holdProgress by remember { mutableFloatStateOf(0f) }
    var showQuickCustomizer by remember { mutableStateOf(false) }

    var selectedType by remember { mutableStateOf(DisasterType.CYCLONE) }
    var selectedSeverity by remember { mutableStateOf(Severity.CRITICAL) }
    var peopleCount by remember { mutableIntStateOf(4) }
    var waterLevelCm by remember { mutableIntStateOf(90) }
    var notes by remember { mutableStateOf("") }
    var isSilent by remember { mutableStateOf(false) }

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(1100, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    val haloAlpha by infiniteTransition.animateFloat(
        initialValue = 0.45f,
        targetValue = 0.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(1100, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "haloAlpha"
    )

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Mode badge indicator
        Surface(
            color = if (isBlackout) WarningYellow.copy(alpha = 0.2f) else SafetyTeal.copy(alpha = 0.2f),
            shape = RoundedCornerShape(20.dp),
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (isBlackout) WarningYellow else SafetyTeal
            ),
            modifier = Modifier.padding(bottom = 12.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = if (isBlackout) Icons.Default.SmsFailed else Icons.Default.GpsFixed,
                    contentDescription = null,
                    tint = if (isBlackout) WarningYellow else SafetyCyan,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (isBlackout) {
                        if (language == Language.BANGLA) "অফলাইন এসএমএস ও বিএলই মেশ মোড সক্রিয়"
                        else "OFFLINE SMS & BLE MESH MODE ACTIVE"
                    } else {
                        if (language == Language.BANGLA) "লাইভ জিপিএস ও ব্রডকাস্ট রেডি"
                        else "HIGH-ACCURACY GPS & CLOUD DISPATCH"
                    },
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isBlackout) WarningYellow else SafetyCyan
                )
            }
        }

        // Giant Circular Pulsing Button
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(240.dp)
                .testTag("sos_giant_button_container")
        ) {
            // Outer Glowing Waves
            Box(
                modifier = Modifier
                    .size(230.dp)
                    .scale(if (isHolding) 1.25f else pulseScale)
                    .clip(CircleShape)
                    .background(EmergencyRed.copy(alpha = haloAlpha))
            )
            Box(
                modifier = Modifier
                    .size(195.dp)
                    .clip(CircleShape)
                    .background(EmergencyRedDark.copy(alpha = 0.35f))
            )

            // Hold Circular Progress Indicator
            if (isHolding) {
                CircularProgressIndicator(
                    progress = { holdProgress },
                    modifier = Modifier.size(175.dp),
                    color = WarningYellow,
                    strokeWidth = 8.dp,
                    trackColor = Color.White.copy(alpha = 0.2f),
                )
            }

            // Core Pressable Button
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(160.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            colors = listOf(EmergencyRedGlow, EmergencyRed, EmergencyRedDark)
                        )
                    )
                    .border(3.dp, Color.White.copy(alpha = 0.8f), CircleShape)
                    .testTag("sos_press_and_hold_button")
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onPress = {
                                isHolding = true
                                holdProgress = 0f
                                val job = coroutineScope.launch {
                                    val startTime = System.currentTimeMillis()
                                    while (isHolding && holdProgress < 1f) {
                                        val elapsed = System.currentTimeMillis() - startTime
                                        holdProgress = (elapsed / 3000f).coerceIn(0f, 1f)
                                        if (holdProgress >= 1f) {
                                            onTriggerSos(
                                                selectedType,
                                                selectedSeverity,
                                                peopleCount,
                                                waterLevelCm,
                                                notes,
                                                isSilent
                                            )
                                            isHolding = false
                                            break
                                        }
                                        delay(50)
                                    }
                                }
                                tryAwaitRelease()
                                isHolding = false
                                holdProgress = 0f
                                job.cancel()
                            }
                        )
                    }
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = "SOS Warning",
                        tint = Color.White,
                        modifier = Modifier.size(36.dp)
                    )
                    Text(
                        text = "SOS",
                        color = Color.White,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp
                    )
                    Text(
                        text = if (isHolding) {
                            "${(3 - (holdProgress * 3)).toInt() + 1}s..."
                        } else {
                            if (language == Language.BANGLA) "৩ সে. চেপে ধরুন" else "HOLD 3 SEC"
                        },
                        color = Color.White.copy(alpha = 0.9f),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Quick Situation Customizer Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            FilledTonalButton(
                onClick = { showQuickCustomizer = true },
                colors = ButtonDefaults.filledTonalButtonColors(
                    containerColor = SlateCardElevated,
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.testTag("customize_sos_button")
            ) {
                Icon(Icons.Default.Tune, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (language == Language.BANGLA) "জরুরি বিবরণ যোগ করুন" else "Customize Emergency Details",
                    fontSize = 12.sp
                )
            }
        }
    }

    if (showQuickCustomizer) {
        Dialog(onDismissRequest = { showQuickCustomizer = false }) {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    Text(
                        text = if (language == Language.BANGLA) "জরুরি তথ্য কনফিগারেশন" else "Emergency Parameters",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = if (language == Language.BANGLA) "উদ্ধারকারীদের সঠিক সংকেত পাঠানোর জন্য নির্বাচন করুন"
                        else "Pre-configure your crisis details before transmitting SOS broadcast.",
                        fontSize = 12.sp,
                        color = SlateMuted
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text("Disaster Type:", color = SlateLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf(DisasterType.CYCLONE, DisasterType.FLOOD, DisasterType.MEDICAL).forEach { type ->
                            FilterChip(
                                selected = selectedType == type,
                                onClick = { selectedType = type },
                                label = { Text(type.name, fontSize = 10.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = EmergencyRed,
                                    selectedLabelColor = Color.White
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Victims Trapped: $peopleCount people", color = SlateLight, fontSize = 12.sp)
                    Slider(
                        value = peopleCount.toFloat(),
                        onValueChange = { peopleCount = it.toInt() },
                        valueRange = 1f..15f,
                        steps = 13,
                        colors = SliderDefaults.colors(
                            thumbColor = EmergencyRed,
                            activeTrackColor = EmergencyRed
                        )
                    )

                    Text("Water Level: $waterLevelCm cm", color = SlateLight, fontSize = 12.sp)
                    Slider(
                        value = waterLevelCm.toFloat(),
                        onValueChange = { waterLevelCm = it.toInt() },
                        valueRange = 0f..300f,
                        steps = 29,
                        colors = SliderDefaults.colors(
                            thumbColor = SafetyCyan,
                            activeTrackColor = SafetyCyan
                        )
                    )

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Checkbox(
                            checked = isSilent,
                            onCheckedChange = { isSilent = it },
                            colors = CheckboxDefaults.colors(checkedColor = EmergencyRed)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Silent SOS Mode (No siren/flash)", color = SlateLight, fontSize = 12.sp)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = { showQuickCustomizer = false },
                        colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Save & Ready", color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun ActiveSosStatusCard(
    alert: SosAlert,
    isRecording: Boolean,
    secondsLeft: Int,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = EmergencyRedDark.copy(alpha = 0.95f)),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(2.dp, EmergencyRedGlow),
        modifier = modifier
            .fillMaxWidth()
            .testTag("active_sos_status_card")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Sensors,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "EMERGENCY BROADCAST LIVE",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black
                    )
                }

                IconButton(
                    onClick = onCancel,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(Icons.Default.Close, contentDescription = "Cancel SOS", tint = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "ID: ${alert.id} • ${alert.locationName}",
                color = Color.White.copy(alpha = 0.9f),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "GPS: ${alert.latitude}, ${alert.longitude} • Headcount: ${alert.peopleCount}",
                color = SlateLight,
                fontSize = 11.sp
            )

            if (alert.isBleMeshRelayed) {
                Surface(
                    color = WarningYellow.copy(alpha = 0.25f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.padding(vertical = 6.dp)
                ) {
                    Text(
                        text = "📡 Transmitted via BLE Multi-Hop Mesh (Hop: ${alert.meshHopCount} to Tower)",
                        fontSize = 11.sp,
                        color = WarningYellow,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Audio Stream Recording Visualizer Box
            Surface(
                color = Color.Black.copy(alpha = 0.45f),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Mic,
                            contentDescription = null,
                            tint = if (isRecording) WarningYellow else BengalGreen,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isRecording) "10s Silent Audio Stream: ${secondsLeft}s left" else "Audio captured & uploaded",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    // Mini animated equalizer bars
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(3.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        repeat(5) { index ->
                            val height = if (isRecording) {
                                ((index * 4 + (secondsLeft * 3)) % 14 + 6).dp
                            } else {
                                4.dp
                            }
                            Box(
                                modifier = Modifier
                                    .width(3.dp)
                                    .height(height)
                                    .background(if (isRecording) EmergencyRedGlow else BengalGreen, RoundedCornerShape(2.dp))
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Status timeline badge
            Surface(
                color = SlateSurface,
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.DirectionsRun,
                        contentDescription = null,
                        tint = SafetyCyan,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Status: ${alert.status.label} • Red Crescent & Volunteers alerted",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}
