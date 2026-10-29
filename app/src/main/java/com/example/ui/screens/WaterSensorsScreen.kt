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
import com.example.data.model.WaterLevelSensor
import com.example.data.model.WaterTrend
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

@Composable
fun WaterSensorsScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val sensors by viewModel.waterSensors.collectAsState()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(SlateDark)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = if (language == Language.BANGLA) "আইওটি নদী ও পানি পরিমাপক গেজ" else "IoT River & Flood Gauge Webhooks",
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = if (language == Language.BANGLA) "সুরমা ও কর্ণফুলী নদীর বিপৎসীমা ট্র্যাকিং" else "BWDB Hydrological Automated Sensor Stream",
                        fontSize = 11.sp,
                        color = SlateMuted
                    )
                }

                Surface(
                    color = SafetyCyan.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "MQTT ACTIVE",
                        color = SafetyCyan,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }
            }
        }

        items(sensors, key = { it.id }) { sensor ->
            WaterSensorCard(
                sensor = sensor,
                language = language,
                onSimulateRise = { viewModel.triggerWaterSensorAlarm(sensor.id, sensor.currentLevelMeters + 0.35) }
            )
        }
    }
}

@Composable
private fun WaterSensorCard(
    sensor: WaterLevelSensor,
    language: Language,
    onSimulateRise: () -> Unit
) {
    val isOverDanger = sensor.currentLevelMeters >= sensor.dangerLevelMeters
    val statusColor = if (isOverDanger) EmergencyRed else BengalGreen
    val statusText = if (isOverDanger) "DANGER LEVEL EXCEEDED (+${String.format("%.2f", sensor.currentLevelMeters - sensor.dangerLevelMeters)}M)" else "BELOW DANGER MARK"

    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, statusColor),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("sensor_card_${sensor.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Waves,
                        contentDescription = null,
                        tint = statusColor,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = sensor.riverName,
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Surface(
                    color = statusColor.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = statusText,
                        color = statusColor,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Station: ${sensor.stationName} (${sensor.district})",
                color = SafetyCyan,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Water elevation gauge row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Text(text = "Current Elevation", color = SlateMuted, fontSize = 10.sp)
                    Text(
                        text = "${String.format("%.2f", sensor.currentLevelMeters)} M",
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "Danger Threshold", color = SlateMuted, fontSize = 10.sp)
                    Text(
                        text = "${String.format("%.2f", sensor.dangerLevelMeters)} M",
                        color = WarningYellow,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Gauge Fill Bar
            val fillFraction = (sensor.currentLevelMeters / (sensor.dangerLevelMeters * 1.25)).toFloat().coerceIn(0f, 1f)
            LinearProgressIndicator(
                progress = { fillFraction },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = statusColor,
                trackColor = SlateCardElevated
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Rise Rate: +${sensor.rateOfRiseCmHr} cm/hr • ${sensor.trend.label}",
                    color = SlateLight,
                    fontSize = 10.sp
                )
                Text(
                    text = sensor.lastWebhookPing,
                    color = SlateMuted,
                    fontSize = 9.sp
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Simulate Sensor Spike Button
            Button(
                onClick = onSimulateRise,
                colors = ButtonDefaults.buttonColors(containerColor = SlateCardElevated),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.TrendingUp, contentDescription = null, modifier = Modifier.size(14.dp), tint = WarningYellow)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Simulate Upstream Flash Surge (+35cm)", fontSize = 11.sp, color = Color.White)
            }
        }
    }
}
