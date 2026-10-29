package com.example.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Language
import com.example.data.model.MeshRelayNode
import com.example.ui.theme.*

@Composable
fun MeshRelayVisualizer(
    nodes: List<MeshRelayNode>,
    isBlackout: Boolean,
    language: Language,
    onTransmitPacket: () -> Unit,
    modifier: Modifier = Modifier
) {
    var packetTransmitting by remember { mutableStateOf(false) }
    var currentHop by remember { mutableIntStateOf(0) }

    val infiniteTransition = rememberInfiniteTransition(label = "meshGlow")
    val hopAlpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(700, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "hopAlpha"
    )

    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(20.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, if (isBlackout) WarningYellow else SafetyTeal),
        modifier = modifier
            .fillMaxWidth()
            .testTag("mesh_relay_visualizer_card")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.BluetoothSearching,
                        contentDescription = null,
                        tint = SafetyCyan,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "BLE P2P EMERGENCY MESH RELAY",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Surface(
                    color = BengalGreen.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "4 NODES ACTIVE",
                        color = BengalGreen,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = if (language == Language.BANGLA)
                    "সম্পূর্ণ বিদ্যুৎ ও মোবাইল নেটওয়ার্ক বিচ্ছিন্ন ব্ল্যাকআউট পরিস্থিতিতে ব্লুটুথ লো এনার্জি (BLE) মেশ নেটওয়ার্ক দিয়ে সংকেত এক ডিভাইস থেকে অন্য ডিভাইসে লাফিয়ে ইন্টারনেটের সাথে সংযুক্ত গেটওয়েতে পৌঁছে যায়।"
                else
                    "In total network blackout scenarios, SOS distress packets hop device-to-device via Bluetooth Low Energy (BLE) until reaching an internet-linked relief boat or satellite gateway.",
                fontSize = 11.sp,
                color = SlateMuted,
                lineHeight = 15.sp
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Hop Chain Display
            nodes.forEachIndexed { index, node ->
                val isCurrentHop = packetTransmitting && currentHop == index

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(
                                if (node.isGateway) BengalGreenDark
                                else if (isCurrentHop) EmergencyRed
                                else SlateCardElevated
                            )
                            .border(
                                1.5.dp,
                                if (isCurrentHop) EmergencyRedGlow else if (node.isGateway) BengalGreen else SlateBorder,
                                CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = when {
                                index == 0 -> Icons.Default.Person
                                node.isGateway -> Icons.Default.CellTower
                                else -> Icons.Default.DirectionsBoat
                            },
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = node.nodeName,
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            if (node.isGateway) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    color = SafetyTeal.copy(alpha = 0.3f),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = "GATEWAY",
                                        color = SafetyCyan,
                                        fontSize = 8.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                    )
                                }
                            }
                        }
                        Text(
                            text = "${node.roleType} • ${node.distanceMeters}m away • Signal: ${node.signalStrengthDbm} dBm • Bat: ${node.batteryPct}%",
                            color = SlateMuted,
                            fontSize = 10.sp
                        )
                    }

                    if (isCurrentHop) {
                        Surface(
                            color = EmergencyRed.copy(alpha = hopAlpha),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "RELAYING",
                                color = Color.White,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                if (index < nodes.size - 1) {
                    Box(
                        modifier = Modifier
                            .padding(start = 17.dp)
                            .width(2.dp)
                            .height(16.dp)
                            .background(
                                if (packetTransmitting && currentHop >= index) EmergencyRedGlow
                                else SlateBorder
                            )
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Test Relay Packet Button
            Button(
                onClick = {
                    packetTransmitting = true
                    currentHop = 0
                    onTransmitPacket()
                },
                colors = ButtonDefaults.buttonColors(containerColor = SafetyTeal),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("test_mesh_packet_button")
            ) {
                Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (language == Language.BANGLA) "মেশ প্যাকেট ট্রান্সমিশন টেস্ট" else "Broadcast P2P Mesh Packet",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }

    LaunchedEffect(packetTransmitting) {
        if (packetTransmitting) {
            for (hop in 0 until nodes.size) {
                currentHop = hop
                kotlinx.coroutines.delay(650)
            }
            kotlinx.coroutines.delay(400)
            packetTransmitting = false
        }
    }
}
