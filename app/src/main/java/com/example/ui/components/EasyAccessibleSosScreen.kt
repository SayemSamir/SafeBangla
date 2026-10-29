package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.DisasterType
import com.example.data.model.Language
import com.example.data.model.Severity
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

@Composable
fun EasyAccessibleSosScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val activeSos by viewModel.activeSos.collectAsState()
    val shelters by viewModel.shelters.collectAsState()
    val nearestShelter = shelters.firstOrNull()

    var lastVoiceSpoken by remember { mutableStateOf<String?>(null) }

    val quickDisasterCards = listOf(
        Triple(DisasterType.FLOOD, if (language == Language.BANGLA) "বন্যা / প্লাবন" else "FLOOD TRAPPED", Icons.Default.WaterDrop),
        Triple(DisasterType.CYCLONE, if (language == Language.BANGLA) "ঘূর্ণিঝড়" else "CYCLONE SURGE", Icons.Default.Tornado),
        Triple(DisasterType.MEDICAL, if (language == Language.BANGLA) "সাপের কামড়" else "SNAKEBITE", Icons.Default.Medication),
        Triple(DisasterType.FIRE, if (language == Language.BANGLA) "অগ্নিকাণ্ড" else "FIRE BLAZE", Icons.Default.LocalFireDepartment)
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF090D16))
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // High-Contrast Mode Header
        Surface(
            color = WarningYellow.copy(alpha = 0.2f),
            shape = RoundedCornerShape(12.dp),
            border = androidx.compose.foundation.BorderStroke(2.dp, WarningYellow),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.AccessibilityNew, contentDescription = null, tint = WarningYellow, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = if (language == Language.BANGLA) "সহজ জরুরি মোড (১-ট্যাপ)" else "HARDENED ONE-TAP EMERGENCY",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            color = WarningYellow
                        )
                        Text(
                            text = if (language == Language.BANGLA) "বড় আইকন ও ভয়েস গাইডেন্সে তৈরি" else "Ultra-Accessible, Zero Learning Curve",
                            fontSize = 10.sp,
                            color = Color.White
                        )
                    }
                }

                Button(
                    onClick = { viewModel.toggleEasyAccessibleMode() },
                    colors = ButtonDefaults.buttonColors(containerColor = SlateCardElevated),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text("Exit", color = Color.White, fontSize = 11.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Giant 1-Tap SOS Distress Tile
        Card(
            colors = CardDefaults.cardColors(containerColor = EmergencyRedDark),
            shape = RoundedCornerShape(24.dp),
            border = androidx.compose.foundation.BorderStroke(3.dp, EmergencyRedGlow),
            modifier = Modifier
                .fillMaxWidth()
                .height(150.dp)
                .clickable {
                    viewModel.triggerSos(notes = "Triggered via 1-Tap Hardened Accessible Interface")
                    lastVoiceSpoken = if (language == Language.BANGLA)
                        "জরুরি এসওএস সংকেত সফলভাবে পাঠানো হয়েছে। উদ্ধারকারী দল প্রস্তুত।"
                    else
                        "Emergency SOS broadcast successfully transmitted. Rescuers alerted."
                }
                .testTag("accessible_giant_sos_button")
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(90.dp)
                        .clip(CircleShape)
                        .background(EmergencyRed)
                        .border(3.dp, Color.White, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Warning, contentDescription = null, tint = Color.White, modifier = Modifier.size(52.dp))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(
                        text = if (language == Language.BANGLA) "১-ট্যাপে উদ্ধার ডাকুন" else "1-TAP RESCUE SOS",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Text(
                        text = if (language == Language.BANGLA) "সরাসরি জিপিএস লোকেশন ও অডিও ব্রডকাস্ট" else "Broadcasts GPS & 10s Audio to Responders",
                        fontSize = 11.sp,
                        color = SlateLight
                    )
                }
            }
        }

        if (lastVoiceSpoken != null) {
            Spacer(modifier = Modifier.height(10.dp))
            Surface(
                color = BengalGreenDark,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.VolumeUp, contentDescription = null, tint = BengalGreen, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = lastVoiceSpoken!!,
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = if (language == Language.BANGLA) "নির্দিষ্ট দুর্যোগ বেছে নিন (১-ক্লিক):" else "Select Crisis Type (1-Click):",
            color = Color.White,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.align(Alignment.Start)
        )

        Spacer(modifier = Modifier.height(8.dp))

        // 4 Large One-Tap Visual Cards
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(quickDisasterCards) { (type, label, icon) ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = SlateCardElevated),
                    shape = RoundedCornerShape(18.dp),
                    border = androidx.compose.foundation.BorderStroke(2.dp, SafetyTeal),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                        .clickable {
                            viewModel.triggerSos(type = type, notes = "1-Tap Category: ${type.name}")
                            lastVoiceSpoken = if (language == Language.BANGLA)
                                "${type.banglaLabel} সংক্রান্ত জরুরি উদ্ধার বার্তা পাঠানো হয়েছে।"
                            else
                                "Emergency rescue signal sent for ${type.label}."
                        }
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(12.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(imageVector = icon, contentDescription = null, tint = SafetyCyan, modifier = Modifier.size(44.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = label,
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }

        // Offline Shelter Quick Bearing Box
        nearestShelter?.let { s ->
            Surface(
                color = SlateSurface,
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, SafetyCyan),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.openNavigationMap(s.latitude, s.longitude, s.name) }
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(SafetyTeal.copy(alpha = 0.3f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Navigation, contentDescription = null, tint = SafetyCyan, modifier = Modifier.size(24.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (language == Language.BANGLA) "নিকটস্থ অফলাইন আশ্রয়কেন্দ্র" else "NEAREST PRE-CACHED SHELTER",
                            color = SafetyCyan,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${s.name} (${s.distanceKm} km)",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Icon(Icons.Default.ArrowForward, contentDescription = null, tint = SafetyCyan)
                }
            }
        }
    }
}
