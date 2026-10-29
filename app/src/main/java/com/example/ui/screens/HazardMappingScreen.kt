package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import com.example.data.model.HazardCategory
import com.example.data.model.HazardReport
import com.example.data.model.Language
import com.example.data.model.Severity
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

@Composable
fun HazardMappingScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val hazardReports by viewModel.hazardReports.collectAsState()
    var showCreateHazardDialog by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(SlateDark)
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        // Title & Add Report Button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = if (language == Language.BANGLA) "নাগরিক দুর্যোগ বিপদ ম্যাপ" else "Crowdsourced Hazard Map",
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = if (language == Language.BANGLA) "ছেঁড়া তার, ভাঙা বাঁধ ও সড়ক অবরোধ রিপোর্ট" else "Community Roadblocks, Live Wires & Breaches",
                    fontSize = 11.sp,
                    color = SlateMuted
                )
            }

            Button(
                onClick = { showCreateHazardDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = HazardOrange),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                modifier = Modifier.testTag("report_hazard_button")
            ) {
                Icon(Icons.Default.AddLocationAlt, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Report Hazard", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(bottom = 20.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(hazardReports, key = { it.id }) { report ->
                HazardReportCard(
                    report = report,
                    language = language,
                    onUpvote = { viewModel.upvoteHazard(report.id) },
                    onDownvote = { viewModel.downvoteHazard(report.id) },
                    onNavigate = { viewModel.openNavigationMap(report.latitude, report.longitude, report.title) }
                )
            }
        }
    }

    // New Hazard Report Creation Dialog
    if (showCreateHazardDialog) {
        var selectedCategory by remember { mutableStateOf(HazardCategory.FALLEN_ELECTRIC_WIRE) }
        var hazardTitle by remember { mutableStateOf("") }
        var hazardLocation by remember { mutableStateOf("") }
        var selectedUrgency by remember { mutableStateOf(Severity.CRITICAL) }

        Dialog(onDismissRequest = { showCreateHazardDialog = false }) {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, HazardOrange),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = if (language == Language.BANGLA) "নতুন বিপদ বা ঝুঁকি রিপোর্ট করুন" else "Report New Community Hazard",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = if (language == Language.BANGLA) "অন্যান্য নাগরিক ও উদ্ধারকারীদের সতর্ক করতে সঠিক তথ্য দিন"
                        else "Alert citizens, volunteers, and ambulance crews about local danger spots.",
                        fontSize = 11.sp,
                        color = SlateMuted
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text("Hazard Category:", color = SlateLight, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        HazardCategory.entries.take(4).forEach { cat ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { selectedCategory = cat }
                            ) {
                                RadioButton(
                                    selected = selectedCategory == cat,
                                    onClick = { selectedCategory = cat },
                                    colors = RadioButtonDefaults.colors(selectedColor = HazardOrange)
                                )
                                Text(
                                    text = if (language == Language.BANGLA) cat.banglaLabel else cat.label,
                                    color = Color.White,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    OutlinedTextField(
                        value = hazardTitle,
                        onValueChange = { hazardTitle = it },
                        label = { Text("Description / Warning Title") },
                        placeholder = { Text("e.g. Submerged live wire near bridge") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    OutlinedTextField(
                        value = hazardLocation,
                        onValueChange = { hazardLocation = it },
                        label = { Text("Specific Location / Landmark") },
                        placeholder = { Text("e.g. Teknaf Road KM 8") },
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            if (hazardTitle.isNotBlank()) {
                                viewModel.submitHazardReport(
                                    category = selectedCategory,
                                    title = hazardTitle,
                                    banglaTitle = hazardTitle,
                                    location = hazardLocation.ifBlank { "Local Ward" },
                                    urgency = selectedUrgency
                                )
                                showCreateHazardDialog = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = HazardOrange),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Publish, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("PUBLISH HAZARD ALERT", fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    TextButton(
                        onClick = { showCreateHazardDialog = false },
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
private fun HazardReportCard(
    report: HazardReport,
    language: Language,
    onUpvote: () -> Unit,
    onDownvote: () -> Unit,
    onNavigate: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            if (report.urgency == Severity.CRITICAL) EmergencyRed else SlateBorder
        ),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("hazard_card_${report.id}")
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = when (report.category) {
                            HazardCategory.FALLEN_ELECTRIC_WIRE -> Icons.Default.ElectricBolt
                            HazardCategory.EMBANKMENT_BREACH -> Icons.Default.Waves
                            HazardCategory.BRIDGE_COLLAPSED -> Icons.Default.DirectionsTransit
                            else -> Icons.Default.Warning
                        },
                        contentDescription = null,
                        tint = if (report.urgency == Severity.CRITICAL) EmergencyRedGlow else HazardOrange,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (language == Language.BANGLA) report.category.banglaLabel else report.category.label,
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (report.isVerifiedByAuthority) {
                    Surface(
                        color = BengalGreenDark.copy(alpha = 0.35f),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Verified, contentDescription = null, tint = BengalGreen, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("COMMUNITY VERIFIED", color = BengalGreen, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = if (language == Language.BANGLA) report.banglaTitle else report.title,
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = "Location: ${report.locationName} • Reported by ${report.reporterName}",
                color = SlateMuted,
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Upvote / Downvote and Navigation Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilledTonalButton(
                        onClick = onUpvote,
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = if (report.userVotedUp) SafetyTeal else SlateCardElevated
                        ),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)
                    ) {
                        Icon(Icons.Default.ThumbUp, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.White)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Confirm (${report.upvotes})", fontSize = 11.sp, color = Color.White)
                    }

                    FilledTonalButton(
                        onClick = onDownvote,
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = if (report.userVotedDown) EmergencyRedDark else SlateCardElevated
                        ),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Icon(Icons.Default.ThumbDown, contentDescription = null, modifier = Modifier.size(14.dp), tint = SlateLight)
                    }
                }

                IconButton(
                    onClick = onNavigate,
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(SlateCardElevated)
                ) {
                    Icon(Icons.Default.Navigation, contentDescription = "Navigate", tint = SafetyCyan, modifier = Modifier.size(16.dp))
                }
            }
        }
    }
}
