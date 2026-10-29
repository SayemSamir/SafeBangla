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
import com.example.data.model.Shelter
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

@Composable
fun AdminDashboardScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val sosAlerts by viewModel.sosAlerts.collectAsState()
    val shelters by viewModel.shelters.collectAsState()
    val hospitals by viewModel.hospitals.collectAsState()
    var showBroadcastModal by remember { mutableStateOf(false) }

    // Division SOS count metrics
    val divisionStats = remember(sosAlerts) {
        listOf(
            "Chattogram" to sosAlerts.count { it.division == "Chattogram" },
            "Sylhet" to sosAlerts.count { it.division == "Sylhet" },
            "Barishal" to sosAlerts.count { it.division == "Barishal" },
            "Dhaka" to sosAlerts.count { it.division == "Dhaka" },
            "Khulna" to 1,
            "Rajshahi" to 0
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(SlateDark)
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        // Title and Push Warning Broadcast Button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = if (language == Language.BANGLA) "জাতীয় দুর্যোগ কন্ট্রোল ড্যাশবোর্ড" else "National Disaster Command Center",
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = if (language == Language.BANGLA) "লাইভ হিটম্যাপ ও রিসোর্স নিয়ন্ত্রণ" else "Live Heatmap, Shelters & FCM Broadcasting",
                    fontSize = 11.sp,
                    color = SlateMuted
                )
            }

            Button(
                onClick = { showBroadcastModal = true },
                colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                modifier = Modifier.testTag("admin_broadcast_button")
            ) {
                Icon(Icons.Default.Campaign, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Broadcast", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(bottom = 20.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            // High-Level Summary Stats
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    AdminMetricCard(
                        title = "Active SOS Calls",
                        value = "${sosAlerts.size}",
                        color = EmergencyRed,
                        icon = Icons.Default.Warning,
                        modifier = Modifier.weight(1f)
                    )
                    AdminMetricCard(
                        title = "Shelters Tracked",
                        value = "${shelters.size}",
                        color = BengalGreen,
                        icon = Icons.Default.HolidayVillage,
                        modifier = Modifier.weight(1f)
                    )
                    AdminMetricCard(
                        title = "Ambulance Units",
                        value = "${hospitals.sumOf { it.ambulanceFleetCount }}",
                        color = SafetyCyan,
                        icon = Icons.Default.LocalHospital,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Bangladesh Regional Heatmap Overview
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = SlateSurface),
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "National Incident Heatmap Distribution",
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Surface(
                                color = EmergencyRed.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = "LIVE CLUSTERS",
                                    color = EmergencyRedGlow,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        divisionStats.forEach { (division, count) ->
                            val maxCount = 4
                            val fraction = if (count > 0) (count.toFloat() / maxCount).coerceIn(0.15f, 1f) else 0.05f
                            val barColor = if (count >= 2) EmergencyRed else if (count == 1) WarningYellow else SlateBorder

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = division,
                                    color = SlateLight,
                                    fontSize = 11.sp,
                                    modifier = Modifier.width(85.dp)
                                )
                                LinearProgressIndicator(
                                    progress = { fraction },
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(8.dp)
                                        .clip(RoundedCornerShape(4.dp)),
                                    color = barColor,
                                    trackColor = SlateCardElevated
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "$count alerts",
                                    color = if (count > 0) Color.White else SlateMuted,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.width(50.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Real-Time Shelter Capacity Database Controls
            item {
                Text(
                    text = "Live Shelter Capacity & Resource Control",
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            items(shelters, key = { it.id }) { shelter ->
                AdminShelterControlCard(
                    shelter = shelter,
                    onAddOccupancy = { viewModel.updateShelterCapacity(shelter.id, 50) },
                    onReduceOccupancy = { viewModel.updateShelterCapacity(shelter.id, -50) }
                )
            }
        }
    }

    // Push Broadcast Dialog
    if (showBroadcastModal) {
        var alertTitle by remember { mutableStateOf("Severe Cyclone 'Moni' - Coastal Evacuation") }
        var banglaTitle by remember { mutableStateOf("তীব্র ঘূর্ণিঝড় 'মনি' - উপকূলীয় স্থানান্তর নির্দেশ") }
        var signalLevel by remember { mutableStateOf("Great Danger Signal 10") }
        var selectedSeverity by remember { mutableStateOf(Severity.CRITICAL) }

        Dialog(onDismissRequest = { showBroadcastModal = false }) {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, EmergencyRed),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Campaign, contentDescription = null, tint = WarningYellow)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Broadcast FCM Alert", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = alertTitle,
                        onValueChange = { alertTitle = it },
                        label = { Text("English Title") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    OutlinedTextField(
                        value = banglaTitle,
                        onValueChange = { banglaTitle = it },
                        label = { Text("Bangla Title") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    OutlinedTextField(
                        value = signalLevel,
                        onValueChange = { signalLevel = it },
                        label = { Text("Signal Level (e.g. Signal 10)") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            viewModel.broadcastAdminAlert(
                                title = alertTitle,
                                banglaTitle = banglaTitle,
                                signalLevel = signalLevel,
                                regions = listOf("Chattogram", "Cox's Bazar", "Barguna"),
                                severity = selectedSeverity,
                                desc = "Urgent evacuation directive issued by BMD & CPP.",
                                banglaDesc = "সিপিপি ও আবহাওয়া অধিদপ্তর কর্তৃক উপকূলীয় চরবাসীদের দ্রুত পাকা সাইক্লোন শেল্টারে যাওয়ার নির্দেশ।"
                            )
                            showBroadcastModal = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("PUSH BROADCAST NATIONWIDE", fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    TextButton(
                        onClick = { showBroadcastModal = false },
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    ) {
                        Text("Cancel", color = SlateMuted)
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminMetricCard(
    title: String,
    value: String,
    color: Color,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier
) {
    Surface(
        color = SlateSurface,
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Black)
            Text(text = title, color = SlateMuted, fontSize = 9.sp)
        }
    }
}

@Composable
private fun AdminShelterControlCard(
    shelter: Shelter,
    onAddOccupancy: () -> Unit,
    onReduceOccupancy: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = shelter.name,
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Capacity: ${shelter.currentOccupancy} / ${shelter.totalCapacity} (${shelter.status.name})",
                    color = SafetyCyan,
                    fontSize = 11.sp
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                FilledTonalButton(
                    onClick = onReduceOccupancy,
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text("-50", fontSize = 11.sp)
                }
                FilledTonalButton(
                    onClick = onAddOccupancy,
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text("+50", fontSize = 11.sp)
                }
            }
        }
    }
}
