package com.example.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.FamilyMember
import com.example.ui.viewmodel.SafeBanglaViewModel
import kotlin.math.cos
import kotlin.math.sin

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FamilySafetyScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val familyMembers by viewModel.familyMembers.collectAsState()
    var showBroadcastSuccess by remember { mutableStateOf(false) }

    val dangerCount = familyMembers.count { !it.isSafe }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            "Family Safety Circle",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            if (dangerCount > 0) "⚠️ $dangerCount member(s) reported IN DANGER"
                            else "All ${familyMembers.size} members Safe & Connected",
                            style = MaterialTheme.typography.bodySmall,
                            color = if (dangerCount > 0) Color(0xFFEF4444) else Color(0xFF10B981)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A)
                ),
                actions = {
                    IconButton(
                        onClick = {
                            viewModel.broadcastIamSafe()
                            showBroadcastSuccess = true
                        },
                        modifier = Modifier.testTag("broadcast_safe_btn")
                    ) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = "Broadcast I Am Safe",
                            tint = Color(0xFF10B981)
                        )
                    }
                }
            )
        },
        containerColor = Color(0xFF0B1120),
        modifier = modifier
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // One-Tap "I Am Safe" Broadcast Banner
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF1E293B).copy(alpha = 0.9f)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color(0xFF10B981).copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "1-Tap Family Broadcast",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                            Text(
                                "Instantly push your GPS pin and 'SAFE' beacon to your Circle",
                                color = Color(0xFF94A3B8),
                                fontSize = 12.sp
                            )
                        }
                        Button(
                            onClick = {
                                viewModel.broadcastIamSafe()
                                showBroadcastSuccess = true
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF10B981)
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.testTag("i_am_safe_button")
                        ) {
                            Icon(Icons.Default.Shield, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("I AM SAFE", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Interactive Panic Radar Component
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF0F172A)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color(0xFF334155), RoundedCornerShape(20.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
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
                                        .background(Color(0xFF38BDF8))
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    "Emergency Panic Radar",
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    fontSize = 15.sp
                                )
                            }
                            Text(
                                "Live 15km Scan",
                                color = Color(0xFF38BDF8),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Radar Canvas
                        PanicRadarCanvas(
                            familyMembers = familyMembers,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(260.dp)
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            RadarLegendItem(color = Color(0xFF10B981), label = "Safe & Resilient")
                            RadarLegendItem(color = Color(0xFFEF4444), label = "In Danger / SOS")
                        }
                    }
                }
            }

            // Family Member List Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Circle Members (${familyMembers.size})",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        "Tap card to toggle danger status",
                        color = Color(0xFF64748B),
                        fontSize = 11.sp
                    )
                }
            }

            // Family Members Cards
            items(familyMembers, key = { it.id }) { member ->
                FamilyMemberCard(
                    member = member,
                    onToggleStatus = {
                        viewModel.toggleFamilyMemberSafety(member.id)
                    }
                )
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }

    if (showBroadcastSuccess) {
        AlertDialog(
            onDismissRequest = { showBroadcastSuccess = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Safety Broadcast Sent!", color = Color.White)
                }
            },
            text = {
                Text(
                    "Your family circle has received your verified 'SAFE' status beacon along with your exact GPS coordinates and timestamp.",
                    color = Color(0xFFCBD5E1)
                )
            },
            confirmButton = {
                Button(
                    onClick = { showBroadcastSuccess = false },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                ) {
                    Text("Understood")
                }
            },
            containerColor = Color(0xFF1E293B)
        )
    }
}

@Composable
fun PanicRadarCanvas(
    familyMembers: List<FamilyMember>,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "RadarSweep")
    val sweepAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "SweepAngle"
    )

    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "PulseAlpha"
    )

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2f, size.height / 2f)
            val maxRadius = (minOf(size.width, size.height) / 2f) * 0.92f

            // Concentric Rings
            val rings = listOf(0.33f, 0.66f, 1.0f)
            rings.forEach { ratio ->
                drawCircle(
                    color = Color(0xFF1E293B),
                    radius = maxRadius * ratio,
                    center = center,
                    style = Stroke(width = 1.5.dp.toPx())
                )
            }

            // Crosshairs
            drawLine(
                color = Color(0xFF1E293B),
                start = Offset(center.x, center.y - maxRadius),
                end = Offset(center.x, center.y + maxRadius),
                strokeWidth = 1.dp.toPx()
            )
            drawLine(
                color = Color(0xFF1E293B),
                start = Offset(center.x - maxRadius, center.y),
                end = Offset(center.x + maxRadius, center.y),
                strokeWidth = 1.dp.toPx()
            )

            // Sweep Line
            val sweepRad = Math.toRadians(sweepAngle.toDouble())
            val sweepEnd = Offset(
                x = center.x + (maxRadius * cos(sweepRad)).toFloat(),
                y = center.y + (maxRadius * sin(sweepRad)).toFloat()
            )
            drawLine(
                brush = Brush.linearGradient(
                    colors = listOf(Color(0xFF38BDF8).copy(alpha = 0.7f), Color.Transparent),
                    start = center,
                    end = sweepEnd
                ),
                start = center,
                end = sweepEnd,
                strokeWidth = 2.5.dp.toPx()
            )

            // Self Marker (Center)
            drawCircle(
                color = Color(0xFF38BDF8),
                radius = 6.dp.toPx(),
                center = center
            )
            drawCircle(
                color = Color(0xFF38BDF8).copy(alpha = pulseAlpha),
                radius = 12.dp.toPx(),
                center = center,
                style = Stroke(width = 2.dp.toPx())
            )

            // Plot Family Members
            familyMembers.forEachIndexed { index, member ->
                val angleDeg = (index * 72.0 + 35.0)
                val rad = Math.toRadians(angleDeg)
                val distRatio = (member.distanceKm / 15.0).coerceIn(0.2, 0.88).toFloat()
                val targetRadius = maxRadius * distRatio
                val blipOffset = Offset(
                    x = center.x + (targetRadius * cos(rad)).toFloat(),
                    y = center.y + (targetRadius * sin(rad)).toFloat()
                )

                val blipColor = if (member.isSafe) Color(0xFF10B981) else Color(0xFFEF4444)

                if (!member.isSafe) {
                    drawCircle(
                        color = Color(0xFFEF4444).copy(alpha = pulseAlpha),
                        radius = 16.dp.toPx(),
                        center = blipOffset
                    )
                }

                drawCircle(
                    color = blipColor,
                    radius = 7.dp.toPx(),
                    center = blipOffset
                )
            }
        }
    }
}

@Composable
fun FamilyMemberCard(
    member: FamilyMember,
    onToggleStatus: () -> Unit
) {
    val statusColor = if (member.isSafe) Color(0xFF10B981) else Color(0xFFEF4444)

    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B)
        ),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggleStatus() }
            .border(
                1.dp,
                if (!member.isSafe) Color(0xFFEF4444).copy(alpha = 0.6f)
                else Color(0xFF334155),
                RoundedCornerShape(14.dp)
            )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(statusColor.copy(alpha = 0.2f))
                    .border(1.5.dp, statusColor, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    member.name.take(1).uppercase(),
                    color = statusColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        member.name,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Text(
                        "• ${member.relationship}",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }

                Spacer(modifier = Modifier.height(2.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = Color(0xFF94A3B8),
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(modifier = Modifier.width(2.dp))
                    Text(
                        "${String.format("%.1f", member.distanceKm)} km away (${member.phone})",
                        color = Color(0xFF94A3B8),
                        fontSize = 11.sp
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.BatteryChargingFull,
                            contentDescription = null,
                            tint = if (member.batteryPct < 20) Color(0xFFEF4444) else Color(0xFF10B981),
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            "${member.batteryPct}%",
                            color = Color(0xFFCBD5E1),
                            fontSize = 11.sp
                        )
                    }

                    Text(
                        "Checked in: ${member.lastCheckIn}",
                        color = Color(0xFF64748B),
                        fontSize = 10.sp
                    )
                }
            }

            // Status Badge
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = statusColor.copy(alpha = 0.15f),
                border = androidx.compose.foundation.BorderStroke(1.dp, statusColor.copy(alpha = 0.4f))
            ) {
                Text(
                    if (member.isSafe) "SAFE" else "DANGER",
                    color = statusColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}

@Composable
fun RadarLegendItem(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(color)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            label,
            color = Color(0xFF94A3B8),
            fontSize = 10.sp
        )
    }
}
