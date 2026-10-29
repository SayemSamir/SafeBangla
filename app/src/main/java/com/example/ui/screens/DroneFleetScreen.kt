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
import com.example.data.model.DroneStatus
import com.example.data.model.DroneType
import com.example.data.model.DroneUnit
import com.example.data.model.Language
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

@Composable
fun DroneFleetScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val droneFleet by viewModel.droneFleet.collectAsState()
    var selectedDroneForVideo by remember { mutableStateOf<DroneUnit?>(droneFleet.firstOrNull()) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(SlateDark)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = if (language == Language.BANGLA) "ড্রোন ও রোবট ফ্লিট কমান্ড" else "Autonomous Drone Fleet Ops",
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = if (language == Language.BANGLA) "আকাশপথে জীবনরক্ষাকারী ওষুধ ও খাদ্য সরবরাহ" else "Airdrop Payloads & Real-Time Aerial Telemetry",
                        fontSize = 11.sp,
                        color = SlateMuted
                    )
                }

                Surface(
                    color = SafetyCyan.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "${droneFleet.size} UNITS LIVE",
                        color = SafetyCyan,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }

        // Live Drone Video Stream Ingestion Viewport
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color.Black),
                shape = RoundedCornerShape(18.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, SafetyCyan),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("drone_live_video_card")
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
                                    .background(EmergencyRed)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "LIVE UAV OPTICAL STREAM • 1080p 60FPS",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black
                            )
                        }

                        Text(
                            text = selectedDroneForVideo?.callsign ?: "UAV-1",
                            color = SafetyCyan,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Video HUD Simulator Viewport
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF07111E))
                            .border(1.dp, SlateBorder, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        // Tactical HUD Crosshairs
                        Icon(
                            imageVector = Icons.Default.FilterCenterFocus,
                            contentDescription = null,
                            tint = SafetyCyan.copy(alpha = 0.6f),
                            modifier = Modifier.size(64.dp)
                        )

                        // Top Left Telemetry Overlay
                        Column(
                            modifier = Modifier
                                .align(Alignment.TopStart)
                                .padding(10.dp)
                        ) {
                            Text("ALT: ${selectedDroneForVideo?.currentAltitudeMeters ?: 85}M", color = BengalGreen, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Text("SPD: ${selectedDroneForVideo?.speedKmh ?: 54} KM/H", color = BengalGreen, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Text("BAT: ${selectedDroneForVideo?.batteryPct ?: 82}%", color = WarningYellow, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }

                        // Top Right Drop Zone Overlay
                        Column(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(10.dp),
                            horizontalAlignment = Alignment.End
                        ) {
                            Text("PAYLOAD: ${selectedDroneForVideo?.payloadKg ?: 8.5} KG", color = SafetyCyan, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Text("SIG: ${selectedDroneForVideo?.telemetryDbm ?: -54} DBM", color = Color.White, fontSize = 10.sp)
                        }

                        // Bottom Center Status
                        Surface(
                            color = Color.Black.copy(alpha = 0.6f),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(8.dp)
                        ) {
                            Text(
                                text = "TARGET: ${selectedDroneForVideo?.destinationZone ?: "Cox's Bazar Sector"}",
                                color = Color.White,
                                fontSize = 10.sp,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Airdrop Action Button
                    Button(
                        onClick = {
                            selectedDroneForVideo?.let { viewModel.triggerDroneAirdrop(it.id) }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("trigger_airdrop_button")
                    ) {
                        Icon(Icons.Default.FlightLand, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("TRIGGER RAPID PARACHUTE AIRDROP", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }

        // Fleet Unit List
        item {
            Text(
                text = "Autonomous Rescue Fleet Units:",
                color = Color.White,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
        }

        items(droneFleet, key = { it.id }) { drone ->
            DroneCard(
                drone = drone,
                isSelected = selectedDroneForVideo?.id == drone.id,
                onSelect = { selectedDroneForVideo = drone },
                onDispatch = { viewModel.dispatchDroneToMission(drone.id, "Emergency Haor Cluster (SOS-7120)") }
            )
        }
    }
}

@Composable
private fun DroneCard(
    drone: DroneUnit,
    isSelected: Boolean,
    onSelect: () -> Unit,
    onDispatch: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, if (isSelected) SafetyCyan else SlateBorder),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("drone_card_${drone.id}")
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (drone.type == DroneType.AMPHIBIOUS_RESCUE_ROBOT) Icons.Default.DirectionsBoat else Icons.Default.Flight,
                        contentDescription = null,
                        tint = SafetyCyan,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "${drone.callsign} (${drone.id})",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Surface(
                    color = if (drone.status == DroneStatus.DELIVERING_PAYLOAD) WarningYellow.copy(alpha = 0.2f) else BengalGreen.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = drone.status.label,
                        color = if (drone.status == DroneStatus.DELIVERING_PAYLOAD) WarningYellow else BengalGreen,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Type: ${drone.type.label} • Battery: ${drone.batteryPct}%",
                color = SlateLight,
                fontSize = 11.sp
            )
            Text(
                text = "Carrying: ${drone.payloadDescription} (${drone.payloadKg} kg)",
                color = WarningYellow,
                fontSize = 11.sp
            )
            Text(
                text = "Destination: ${drone.destinationZone}",
                color = SlateMuted,
                fontSize = 10.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onSelect,
                    border = androidx.compose.foundation.BorderStroke(1.dp, SafetyCyan),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Videocam, contentDescription = null, modifier = Modifier.size(14.dp), tint = SafetyCyan)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("View Stream", fontSize = 11.sp, color = Color.White)
                }

                Button(
                    onClick = onDispatch,
                    colors = ButtonDefaults.buttonColors(containerColor = SafetyTeal),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Dispatch Drone", fontSize = 11.sp)
                }
            }
        }
    }
}
