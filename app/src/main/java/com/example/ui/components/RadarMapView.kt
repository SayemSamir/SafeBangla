package com.example.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GpsFixed
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Shelter
import com.example.data.model.ShelterStatus
import com.example.data.model.SosAlert
import com.example.ui.theme.*
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun RadarMapView(
    shelters: List<Shelter>,
    sosAlerts: List<SosAlert>,
    onSelectShelter: (Shelter) -> Unit,
    onSelectSos: (SosAlert) -> Unit,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "radar")
    val sweepAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "sweep"
    )

    var selectedItemDescription by remember { mutableStateOf<String?>(null) }

    Card(
        colors = CardDefaults.cardColors(containerColor = SlateDark),
        shape = RoundedCornerShape(20.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
        modifier = modifier
            .fillMaxWidth()
            .testTag("radar_map_card")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.GpsFixed,
                        contentDescription = null,
                        tint = SafetyCyan,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "5KM TACTICAL DISASTER RADAR",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                }

                Surface(
                    color = SafetyTeal.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "GPS LOCK: LIVE",
                        color = SafetyCyan,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Radar Canvas
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0xFF070B14))
                    .border(1.dp, SlateBorder, RoundedCornerShape(14.dp)),
                contentAlignment = Alignment.Center
            ) {
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInput(Unit) {
                            detectTapGestures { offset ->
                                val center = Offset(size.width / 2f, size.height / 2f)
                                // Find nearest shelter or SOS
                                shelters.firstOrNull()?.let {
                                    selectedItemDescription = "Shelter: ${it.name} (${it.distanceKm} km) • Occupancy: ${it.currentOccupancy}/${it.totalCapacity}"
                                    onSelectShelter(it)
                                }
                            }
                        }
                ) {
                    val center = Offset(size.width / 2f, size.height / 2f)
                    val maxRadius = minOf(size.width, size.height) * 0.44f

                    // Concentric Range Rings
                    listOf(0.33f, 0.66f, 1.0f).forEachIndexed { index, fraction ->
                        val r = maxRadius * fraction
                        drawCircle(
                            color = SlateBorder.copy(alpha = 0.6f),
                            radius = r,
                            center = center,
                            style = Stroke(width = 1.5f)
                        )
                    }

                    // Crosshair axis lines
                    drawLine(
                        color = SlateBorder.copy(alpha = 0.5f),
                        start = Offset(center.x - maxRadius, center.y),
                        end = Offset(center.x + maxRadius, center.y),
                        strokeWidth = 1f
                    )
                    drawLine(
                        color = SlateBorder.copy(alpha = 0.5f),
                        start = Offset(center.x, center.y - maxRadius),
                        end = Offset(center.x, center.y + maxRadius),
                        strokeWidth = 1f
                    )

                    // Sweeping beam
                    val rad = Math.toRadians(sweepAngle.toDouble())
                    val sweepEnd = Offset(
                        (center.x + maxRadius * cos(rad)).toFloat(),
                        (center.y + maxRadius * sin(rad)).toFloat()
                    )
                    drawLine(
                        brush = Brush.linearGradient(
                            colors = listOf(SafetyCyan.copy(alpha = 0.8f), Color.Transparent),
                            start = center,
                            end = sweepEnd
                        ),
                        start = center,
                        end = sweepEnd,
                        strokeWidth = 3f
                    )

                    // Center user position
                    drawCircle(color = SafetyCyan, radius = 6f, center = center)
                    drawCircle(
                        color = SafetyCyan.copy(alpha = 0.35f),
                        radius = 14f,
                        center = center
                    )

                    // Plot Shelters around center
                    shelters.forEachIndexed { i, s ->
                        val angle = (i * 72 + 25) * (Math.PI / 180.0)
                        val distFraction = (s.distanceKm / 6.0).coerceIn(0.25, 0.95)
                        val sx = (center.x + maxRadius * distFraction * cos(angle)).toFloat()
                        val sy = (center.y + maxRadius * distFraction * sin(angle)).toFloat()

                        val shelterColor = when (s.status) {
                            ShelterStatus.AVAILABLE -> BengalGreen
                            ShelterStatus.FILLING_FAST -> WarningYellow
                            ShelterStatus.FULL -> EmergencyRed
                        }

                        drawCircle(color = shelterColor, radius = 5.5f, center = Offset(sx, sy))
                        drawCircle(
                            color = shelterColor.copy(alpha = 0.25f),
                            radius = 11f,
                            center = Offset(sx, sy)
                        )
                    }

                    // Plot SOS alerts
                    sosAlerts.take(4).forEachIndexed { i, sos ->
                        val angle = (i * 90 + 190) * (Math.PI / 180.0)
                        val distFraction = 0.55 + (i * 0.12)
                        val px = (center.x + maxRadius * distFraction * cos(angle)).toFloat()
                        val py = (center.y + maxRadius * distFraction * sin(angle)).toFloat()

                        drawCircle(color = EmergencyRedGlow, radius = 7f, center = Offset(px, py))
                        drawCircle(
                            color = EmergencyRed.copy(alpha = 0.35f),
                            radius = 16f,
                            center = Offset(px, py),
                            style = Stroke(width = 2f)
                        )
                    }
                }

                // Range Labels Overlay
                Text(
                    text = "1.5 km",
                    color = SlateMuted,
                    fontSize = 9.sp,
                    modifier = Modifier
                        .align(Alignment.Center)
                        .offset(y = (-30).dp)
                )
                Text(
                    text = "3.5 km",
                    color = SlateMuted,
                    fontSize = 9.sp,
                    modifier = Modifier
                        .align(Alignment.Center)
                        .offset(y = (-65).dp)
                )
                Text(
                    text = "5.0 km",
                    color = SlateMuted,
                    fontSize = 9.sp,
                    modifier = Modifier
                        .align(Alignment.Center)
                        .offset(y = (-95).dp)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Legend
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                LegendItem(color = BengalGreen, label = "Shelter (Avail)")
                LegendItem(color = WarningYellow, label = "Filling Fast")
                LegendItem(color = EmergencyRed, label = "Full / SOS")
                LegendItem(color = SafetyCyan, label = "You")
            }

            if (selectedItemDescription != null) {
                Spacer(modifier = Modifier.height(6.dp))
                Surface(
                    color = SlateSurface,
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SafetyCyan.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = selectedItemDescription!!,
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun LegendItem(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(color)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(text = label, color = SlateLight, fontSize = 10.sp)
    }
}
