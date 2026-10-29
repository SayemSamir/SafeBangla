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
import com.example.data.model.Language
import com.example.data.model.Severity
import com.example.data.model.SosAlert
import com.example.data.model.SosStatus
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

@Composable
fun RescueTeamScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val sosAlerts by viewModel.sosAlerts.collectAsState()
    var selectedSeverityFilter by remember { mutableStateOf<Severity?>(null) }

    val filteredAlerts = remember(sosAlerts, selectedSeverityFilter) {
        if (selectedSeverityFilter == null) sosAlerts
        else sosAlerts.filter { it.severity == selectedSeverityFilter }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(SlateDark)
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        // Command Center Title
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = if (language == Language.BANGLA) "উদ্ধারকারী দল কমান্ড পোর্টাল" else "Rescue Team Triage Portal",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = if (language == Language.BANGLA) "জরুরি উদ্ধার ইউনিট ও বোট মোতায়েন" else "High-Priority Triage & Boat Deployment",
                    fontSize = 12.sp,
                    color = SlateMuted
                )
            }

            Surface(
                color = EmergencyRedDark,
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = "COMMAND OPS",
                    color = Color.White,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Triage Filter Tabs (All, Critical Red, High Orange, Medium Yellow)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            FilterChip(
                selected = selectedSeverityFilter == null,
                onClick = { selectedSeverityFilter = null },
                label = { Text("All Triage (${sosAlerts.size})", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = SlateCardElevated,
                    selectedLabelColor = Color.White
                )
            )
            FilterChip(
                selected = selectedSeverityFilter == Severity.CRITICAL,
                onClick = { selectedSeverityFilter = Severity.CRITICAL },
                label = { Text("Critical Only", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = EmergencyRed,
                    selectedLabelColor = Color.White
                )
            )
            FilterChip(
                selected = selectedSeverityFilter == Severity.HIGH,
                onClick = { selectedSeverityFilter = Severity.HIGH },
                label = { Text("High Priority", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = HazardOrange,
                    selectedLabelColor = Color.White
                )
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Incident Cards
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(bottom = 20.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredAlerts, key = { it.id }) { alert ->
                RescueTriageCard(
                    alert = alert,
                    language = language,
                    onDeployBoat = { viewModel.deployRescueUnit(alert.id, "Coast Guard Motorized Zodiac #04") },
                    onDeploySpeedboat = { viewModel.deployRescueUnit(alert.id, "Red Crescent Speedboat #02") },
                    onDeployHelicopter = { viewModel.deployRescueUnit(alert.id, "Air Force SAR Chopper") },
                    onMarkResolved = { viewModel.markResolved(alert.id) },
                    onNavigate = { viewModel.openNavigationMap(alert.latitude, alert.longitude, alert.victimName) },
                    onCall = { viewModel.openDialer(alert.phone) }
                )
            }
        }
    }
}

@Composable
private fun RescueTriageCard(
    alert: SosAlert,
    language: Language,
    onDeployBoat: () -> Unit,
    onDeploySpeedboat: () -> Unit,
    onDeployHelicopter: () -> Unit,
    onMarkResolved: () -> Unit,
    onNavigate: () -> Unit,
    onCall: () -> Unit
) {
    val severityColor = when (alert.severity) {
        Severity.CRITICAL -> EmergencyRed
        Severity.HIGH -> HazardOrange
        Severity.MEDIUM -> WarningYellow
        Severity.LOW -> SafetyTeal
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, severityColor),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("triage_card_${alert.id}")
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
                            .size(12.dp)
                            .clip(CircleShape)
                            .background(severityColor)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "INCIDENT #${alert.id}",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black
                    )
                }

                Surface(
                    color = severityColor.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = "PRIORITY: ${alert.severity.name}",
                        color = severityColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "${alert.disasterType.label} • ${alert.locationName} (${alert.division})",
                color = SlateLight,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = "GPS: ${alert.latitude}, ${alert.longitude} • Victims: ${alert.peopleCount} people • Flood: ${alert.waterLevelCm} cm",
                color = WarningYellow,
                fontSize = 11.sp
            )

            if (alert.notes.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Surface(
                    color = Color.Black.copy(alpha = 0.35f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Field Notes: ${alert.notes}",
                        color = Color.White,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }

            if (alert.assignedUnit != null) {
                Spacer(modifier = Modifier.height(6.dp))
                Surface(
                    color = BengalGreenDark.copy(alpha = 0.3f),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.DirectionsBoat, contentDescription = null, tint = BengalGreen, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "DEPLOYED: ${alert.assignedUnit}",
                            color = BengalGreen,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Deployment Controls
            Text(text = "Deploy Official Response Asset:", color = SlateMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Button(
                    onClick = onDeployBoat,
                    colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.DirectionsBoat, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Zodiac Boat", fontSize = 10.sp)
                }
                Button(
                    onClick = onDeploySpeedboat,
                    colors = ButtonDefaults.buttonColors(containerColor = HazardOrange),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Speed, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Speedboat", fontSize = 10.sp)
                }
                Button(
                    onClick = onDeployHelicopter,
                    colors = ButtonDefaults.buttonColors(containerColor = SafetyTeal),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Flight, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Chopper", fontSize = 10.sp)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                OutlinedButton(
                    onClick = onNavigate,
                    border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Navigation, contentDescription = null, modifier = Modifier.size(14.dp), tint = SafetyCyan)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("GPS Track", fontSize = 11.sp, color = Color.White)
                }
                OutlinedButton(
                    onClick = onCall,
                    border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(14.dp), tint = BengalGreen)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Dial Contact", fontSize = 11.sp, color = Color.White)
                }
                FilledTonalButton(
                    onClick = onMarkResolved,
                    colors = ButtonDefaults.filledTonalButtonColors(containerColor = BengalGreenDark),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.White)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Evacuated", fontSize = 10.sp, color = Color.White)
                }
            }
        }
    }
}
