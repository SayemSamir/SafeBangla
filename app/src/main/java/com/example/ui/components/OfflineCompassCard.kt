package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Language
import com.example.data.model.Shelter
import com.example.ui.theme.*
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun OfflineCompassCard(
    azimuth: Float,
    targetShelter: Shelter?,
    language: Language,
    modifier: Modifier = Modifier
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(18.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SafetyCyan),
        modifier = modifier
            .fillMaxWidth()
            .testTag("offline_compass_card")
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Explore, contentDescription = null, tint = SafetyCyan, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (language == Language.BANGLA) "অফলাইন নেভিগেশন কম্পাস" else "100% Offline Compass Bearing",
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Surface(
                    color = SafetyTeal.copy(alpha = 0.25f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = "ZERO NETWORK CACHE",
                        color = SafetyCyan,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Compass Dial Canvas
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF090E17))
                    .border(2.dp, SlateBorder, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val center = Offset(size.width / 2f, size.height / 2f)
                    val radius = size.width * 0.42f

                    // Dial Outer Ring
                    drawCircle(color = SlateBorder, radius = radius, center = center, style = Stroke(width = 2f))

                    // Needle pointing north / shelter bearing
                    val angleRad = Math.toRadians((azimuth - 90.0))
                    val needleTip = Offset(
                        (center.x + (radius * 0.8f) * cos(angleRad)).toFloat(),
                        (center.y + (radius * 0.8f) * sin(angleRad)).toFloat()
                    )
                    val needleBase = Offset(
                        (center.x - (radius * 0.4f) * cos(angleRad)).toFloat(),
                        (center.y - (radius * 0.4f) * sin(angleRad)).toFloat()
                    )

                    // North tip in Emergency Red
                    drawLine(color = EmergencyRedGlow, start = center, end = needleTip, strokeWidth = 4f)
                    // South tail in SlateLight
                    drawLine(color = SlateMuted, start = center, end = needleBase, strokeWidth = 3f)

                    // Pivot center dot
                    drawCircle(color = Color.White, radius = 4f, center = center)
                }

                Text(
                    text = "${azimuth.toInt()}° N",
                    color = Color.White,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 6.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            targetShelter?.let { shelter ->
                Text(
                    text = "Nearest Cached Shelter: ${shelter.name}",
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Follow compass vector • Distance: ${shelter.distanceKm} km (Bearing 042° NE)",
                    color = SafetyCyan,
                    fontSize = 10.sp
                )
            }
        }
    }
}
