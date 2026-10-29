package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.Language
import com.example.ui.theme.*

@Composable
fun OfflineSmsDialog(
    isOpen: Boolean,
    language: Language,
    onDismiss: () -> Unit,
    onSendSms: (String, String) -> Unit
) {
    if (!isOpen) return

    val samplePayload = remember {
        "[SAFEBANGLA-SOS]!LOC:21.4300,91.9720!BAT:85%!TYPE:CYCLONE!SEV:CRIT!PPL:4!WATER:120CM!TIME:${System.currentTimeMillis() / 1000}"
    }
    var targetNumber by remember { mutableStateOf("999") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            colors = CardDefaults.cardColors(containerColor = SlateSurface),
            shape = RoundedCornerShape(20.dp),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, WarningYellow),
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .testTag("offline_sms_dialog")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.WifiOff,
                        contentDescription = null,
                        tint = WarningYellow,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (language == Language.BANGLA) "অফলাইন এসএমএস ফলব্যাক" else "Offline SOS SMS Fallback",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = if (language == Language.BANGLA)
                        "ইন্টারনেট বা মোবাইল ডাটা বিচ্ছিন্ন হলে স্বয়ংক্রিয়ভাবে একটি কম্প্রেসড ও জিপিএস ট্যাগযুক্ত জরুরি বার্তা তৈরি হয় যা সরাসরি ৯৯৯ অথবা দুর্যোগ হেল্পলাইনে পাঠানো যায়।"
                    else
                        "When cell data or internet is disconnected, SafeBangla formats a compressed, high-density geotagged emergency packet routed via native SMS to national gateways.",
                    fontSize = 12.sp,
                    color = SlateMuted,
                    lineHeight = 16.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                Text("Target Central Gateway:", color = SlateLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = targetNumber == "999",
                        onClick = { targetNumber = "999" },
                        label = { Text("999 (National SOS)", fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = EmergencyRed,
                            selectedLabelColor = Color.White
                        )
                    )
                    FilterChip(
                        selected = targetNumber == "109",
                        onClick = { targetNumber = "109" },
                        label = { Text("109 (Disaster Hotline)", fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = SafetyTeal,
                            selectedLabelColor = Color.White
                        )
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text("Compressed Geotagged Payload:", color = SlateLight, fontSize = 11.sp)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                        .border(1.dp, SlateBorder, RoundedCornerShape(8.dp))
                        .padding(10.dp)
                ) {
                    Text(
                        text = samplePayload,
                        color = BengalGreen,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        lineHeight = 16.sp
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        onSendSms(targetNumber, samplePayload)
                        onDismiss()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("launch_native_sms_button")
                ) {
                    Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (language == Language.BANGLA) "এসএমএস অ্যাপে পাঠান ($targetNumber)" else "Route via Native SMS ($targetNumber)",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                TextButton(
                    onClick = onDismiss,
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                ) {
                    Text("Close", color = SlateMuted, fontSize = 12.sp)
                }
            }
        }
    }
}
