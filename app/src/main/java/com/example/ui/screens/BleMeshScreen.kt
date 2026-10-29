package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Language
import com.example.ui.components.MeshRelayVisualizer
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

@Composable
fun BleMeshScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val isBlackout by viewModel.isBlackoutMode.collectAsState()
    val meshNodes by viewModel.meshNodes.collectAsState()

    var testPacketStatus by remember { mutableStateOf<String?>(null) }

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
                        text = if (language == Language.BANGLA) "ব্লুটুথ অফলাইন মেশ নেটওয়ার্ক" else "BLE Blackout Mesh Network",
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = if (language == Language.BANGLA) "টোটাল ব্ল্যাকআউট পরিস্থিতিতে পিয়ার-টু-পিয়ার রিলে" else "Hop-by-hop emergency relay without cellular service",
                        fontSize = 11.sp,
                        color = SlateMuted
                    )
                }

                Surface(
                    color = if (isBlackout) WarningYellow.copy(alpha = 0.2f) else SafetyTeal.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = if (isBlackout) "BLACKOUT ON" else "CELLULAR ONLINE",
                        color = if (isBlackout) WarningYellow else SafetyCyan,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }
            }
        }

        // Blackout Simulator Toggle Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (isBlackout) WarningYellow else SlateBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (language == Language.BANGLA) "দুর্যোগ ব্ল্যাকআউট সিমুলেশন" else "Simulate Total Network Blackout",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (language == Language.BANGLA) "মোবাইল টাওয়ার ও ইন্টারনেট বিচ্ছিন্ন হলে স্বয়ংক্রিয় মেশ ও এসএমএস সক্রিয় হয়"
                            else "Simulate catastrophic collapse of cellular towers in cyclone zones",
                            color = SlateMuted,
                            fontSize = 10.sp
                        )
                    }

                    Switch(
                        checked = isBlackout,
                        onCheckedChange = { viewModel.toggleBlackoutMode() },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = WarningYellow,
                            checkedTrackColor = WarningYellow.copy(alpha = 0.4f)
                        ),
                        modifier = Modifier.testTag("blackout_mode_toggle")
                    )
                }
            }
        }

        // Live Interactive Mesh Relay Visualizer
        item {
            MeshRelayVisualizer(
                nodes = meshNodes,
                isBlackout = isBlackout,
                language = language,
                onTransmitPacket = {
                    testPacketStatus = "Packet #PKT-942 relayed through 4 nodes: Citizen -> Volunteer Boat -> Buoy -> Satellite Gateway [DELIVERED]"
                }
            )
        }

        if (testPacketStatus != null) {
            item {
                Surface(
                    color = BengalGreenDark.copy(alpha = 0.35f),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BengalGreen),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = BengalGreen)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = testPacketStatus!!,
                            color = Color.White,
                            fontSize = 11.sp,
                            lineHeight = 15.sp
                        )
                    }
                }
            }
        }

        // Protocol Specifications
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "Technical Protocol Specifications",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "• Radio: Bluetooth 5.0 Low Energy (BLE) Advertising Extensions\n• MTU: 244-byte encrypted payload\n• Max Hops: 7 hops before TTL expiry\n• Battery Drain: < 1.2% per hour with low-duty cycle background scan\n• Cryptography: ECDH P-256 key exchange + AES-GCM-128",
                        color = SlateMuted,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }
    }
}
