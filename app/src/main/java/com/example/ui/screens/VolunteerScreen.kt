package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.Language
import com.example.data.model.Severity
import com.example.data.model.SosAlert
import com.example.data.model.SosStatus
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

@Composable
fun VolunteerScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val sosAlerts by viewModel.sosAlerts.collectAsState()
    val volunteerProfile by viewModel.volunteerProfile.collectAsState()
    var showCertificateModal by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(SlateDark)
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        // Volunteer Profile Card & Recognition
        Card(
            colors = CardDefaults.cardColors(containerColor = SlateSurface),
            shape = RoundedCornerShape(16.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, SafetyTeal),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("volunteer_profile_card")
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(SafetyTeal.copy(alpha = 0.25f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = SafetyCyan, modifier = Modifier.size(24.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = volunteerProfile.name,
                                    color = Color.White,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(Icons.Default.CheckCircle, contentDescription = "Verified", tint = BengalGreen, modifier = Modifier.size(16.dp))
                            }
                            Text(
                                text = "${volunteerProfile.rankTitle} • ${volunteerProfile.bloodGroup}",
                                color = SlateMuted,
                                fontSize = 11.sp
                            )
                        }
                    }

                    OutlinedButton(
                        onClick = { showCertificateModal = true },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = SafetyCyan),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SafetyCyan),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Icon(Icons.Default.WorkspacePremium, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Badges", fontSize = 11.sp)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Stats: Hours logged & Missions Completed
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "${volunteerProfile.missionsCompleted}", color = BengalGreen, fontSize = 20.sp, fontWeight = FontWeight.Black)
                        Text(text = "Missions Saved", color = SlateMuted, fontSize = 10.sp)
                    }
                    Box(modifier = Modifier.width(1.dp).height(32.dp).background(SlateBorder))
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "${volunteerProfile.hoursLogged} hrs", color = SafetyCyan, fontSize = 20.sp, fontWeight = FontWeight.Black)
                        Text(text = "Operations Logged", color = SlateMuted, fontSize = 10.sp)
                    }
                    Box(modifier = Modifier.width(1.dp).height(32.dp).background(SlateBorder))
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "5 km", color = WarningYellow, fontSize = 20.sp, fontWeight = FontWeight.Black)
                        Text(text = "Local Radius", color = SlateMuted, fontSize = 10.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Section Title: Real-time Mission Feed
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (language == Language.BANGLA) "স্থানীয় উদ্ধার অভিযান ফিড (৫ কিমি)" else "Localized Rescue Mission Feed (5km)",
                color = Color.White,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
            Surface(
                color = EmergencyRedDark.copy(alpha = 0.3f),
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(
                    text = "${sosAlerts.count { it.status == SosStatus.PENDING }} UNASSIGNED",
                    color = EmergencyRedGlow,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(bottom = 20.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(sosAlerts, key = { it.id }) { sos ->
                VolunteerMissionCard(
                    alert = sos,
                    language = language,
                    onAccept = { viewModel.acceptMission(sos.id) },
                    onNavigate = { viewModel.openNavigationMap(sos.latitude, sos.longitude, sos.victimName) },
                    onCall = { viewModel.openDialer(sos.phone) }
                )
            }
        }
    }

    // Digital Certificate & Recognition Modal
    if (showCertificateModal) {
        Dialog(onDismissRequest = { showCertificateModal = false }) {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, SafetyCyan),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Default.WorkspacePremium, contentDescription = null, tint = WarningYellow, modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "BANGLADESH DISASTER RESCUE CORPS",
                        color = SafetyCyan,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Certificate of Recognition",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Issued to: ${volunteerProfile.name} (${volunteerProfile.rankTitle}) for exemplary courage in cyclone and flood life-saving operations.",
                        color = SlateLight,
                        fontSize = 11.sp,
                        lineHeight = 15.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Text("Awarded Badges:", color = SlateMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Column(
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        volunteerProfile.badges.forEach { badge ->
                            Surface(
                                color = SlateCardElevated,
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.MilitaryTech, contentDescription = null, tint = WarningYellow, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(text = badge, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { showCertificateModal = false },
                        colors = ButtonDefaults.buttonColors(containerColor = SafetyTeal),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Close Credentials", color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
private fun VolunteerMissionCard(
    alert: SosAlert,
    language: Language,
    onAccept: () -> Unit,
    onNavigate: () -> Unit,
    onCall: () -> Unit
) {
    val isPending = alert.status == SosStatus.PENDING
    val severityColor = when (alert.severity) {
        Severity.CRITICAL -> EmergencyRed
        Severity.HIGH -> HazardOrange
        Severity.MEDIUM -> WarningYellow
        Severity.LOW -> SafetyTeal
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            if (isPending) EmergencyRedGlow else SlateBorder
        ),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("mission_card_${alert.id}")
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(severityColor)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "${alert.id} • ${alert.disasterType.name}",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Surface(
                    color = severityColor.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = alert.severity.name,
                        color = severityColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Victim: ${alert.victimName} (${alert.phone})",
                color = SafetyCyan,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = "Location: ${alert.locationName} (${alert.division})",
                color = SlateLight,
                fontSize = 11.sp
            )
            Text(
                text = "Trapped: ${alert.peopleCount} people • Water Level: ${alert.waterLevelCm} cm",
                color = WarningYellow,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )

            if (alert.notes.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Notes: \"${alert.notes}\"",
                    color = SlateMuted,
                    fontSize = 11.sp
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Action row
            if (isPending) {
                Button(
                    onClick = onAccept,
                    colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("accept_mission_button_${alert.id}")
                ) {
                    Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (language == Language.BANGLA) "অভিযান গ্রহণ ও লক করুন" else "Accept Mission & Lock Signal",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            } else {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onNavigate,
                        colors = ButtonDefaults.buttonColors(containerColor = SafetyTeal),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Navigation, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Live Route", fontSize = 11.sp)
                    }
                    OutlinedButton(
                        onClick = onCall,
                        border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(14.dp), tint = SafetyCyan)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Call Victim", fontSize = 11.sp, color = Color.White)
                    }
                }
            }
        }
    }
}
