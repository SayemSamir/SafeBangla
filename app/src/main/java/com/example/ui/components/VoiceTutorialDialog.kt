package com.example.ui.components

import androidx.compose.animation.*
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.Language
import com.example.ui.theme.*

@Composable
fun VoiceTutorialDialog(
    isOpen: Boolean,
    language: Language,
    onDismiss: () -> Unit
) {
    if (!isOpen) return

    var currentStep by remember { mutableIntStateOf(0) }
    var isPlayingVoice by remember { mutableStateOf(true) }

    val steps = listOf(
        TutorialStep(
            title = if (language == Language.BANGLA) "ধাপ ১: লাল এসওএস বাটন ৩ সেকেন্ড চেপে ধরুন" else "Step 1: Hold the Red SOS Button for 3 Seconds",
            audioScript = if (language == Language.BANGLA)
                "জরুরি বিপদে পড়লে হোম স্ক্রিনের বড় লাল এসওএস বোতামটি ৩ সেকেন্ড চেপে ধরুন। এটি আপনার সঠিক অবস্থান ও ১০ সেকেন্ডের অডিও স্বয়ংক্রিয়ভাবে উদ্ধারকারী নৌকায় পাঠিয়ে দেবে।"
            else
                "In extreme danger, press and hold the giant red SOS button for 3 seconds. It captures your exact GPS coordinates and records a 10-second silent audio stream for rescue teams.",
            icon = Icons.Default.Warning,
            iconTint = EmergencyRed
        ),
        TutorialStep(
            title = if (language == Language.BANGLA) "ধাপ ২: ইন্টারনেট না থাকলেও চিন্তা নেই (অফলাইন মোড)" else "Step 2: 100% Offline Mesh & Geotagged SMS",
            audioScript = if (language == Language.BANGLA)
                "যদি মোবাইল নেটওয়ার্ক বা ইন্টারনেট পুরোপুরি বন্ধ থাকে, সেফবাংলা স্বয়ংক্রিয়ভাবে জিপিএস কোঅর্ডিনেট সংবলিত এসএমএস তৈরি করবে অথবা ব্লুটুথ মেশ নেটওয়ার্ক দিয়ে উদ্ধারকারীদের বার্তা পৌঁছে দেবে।"
            else
                "During a total cellular blackout, SafeBangla formats a compressed geotagged SMS or relays packets hop-by-hop via Bluetooth Low Energy Mesh to nearby relief boats.",
            icon = Icons.Default.BluetoothSearching,
            iconTint = SafetyCyan
        ),
        TutorialStep(
            title = if (language == Language.BANGLA) "ধাপ ৩: স্ক্রিন অন না করেই ভলিউম বাটন ৩ বার চাপুন" else "Step 3: Triple-Press Volume Button for Covert SOS",
            audioScript = if (language == Language.BANGLA)
                "ফোন পকেটে থাকা অবস্থায় ভলিউম ডাউন বোতাম পরপর ৩ বার চাপলে স্ক্রিন না খুলেই নিরব এসওএস সংকেত সক্রিয় হয়ে যায়।"
            else
                "Triple-press the physical volume down button to trigger covert emergency SOS without waking up your screen or alerting captors.",
            icon = Icons.Default.TouchApp,
            iconTint = WarningYellow
        )
    )

    Dialog(onDismissRequest = onDismiss) {
        Card(
            colors = CardDefaults.cardColors(containerColor = SlateDark),
            shape = RoundedCornerShape(24.dp),
            border = androidx.compose.foundation.BorderStroke(2.dp, SafetyCyan),
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .testTag("voice_tutorial_modal")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.RecordVoiceOver, contentDescription = null, tint = SafetyCyan)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (language == Language.BANGLA) "অডিও নির্দেশিকা" else "Voice-Guided Onboarding",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Surface(
                        color = SafetyTeal.copy(alpha = 0.2f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "${currentStep + 1} / ${steps.size}",
                            color = SafetyCyan,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                val step = steps[currentStep]

                Box(
                    modifier = Modifier
                        .size(76.dp)
                        .clip(CircleShape)
                        .background(step.iconTint.copy(alpha = 0.2f))
                        .border(2.dp, step.iconTint, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(imageVector = step.icon, contentDescription = null, tint = step.iconTint, modifier = Modifier.size(38.dp))
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = step.title,
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Simulated Audio Voice Playback Bar
                Surface(
                    color = SlateSurface,
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (isPlayingVoice) Icons.Default.GraphicEq else Icons.Default.VolumeMute,
                                contentDescription = null,
                                tint = SafetyCyan,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (isPlayingVoice) "🔊 Voice Audio Narrating..." else "Paused",
                                color = SafetyCyan,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "\"${step.audioScript}\"",
                            color = SlateLight,
                            fontSize = 12.sp,
                            lineHeight = 17.sp,
                            textAlign = TextAlign.Start
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Next or Finish Controls
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (currentStep > 0) {
                        OutlinedButton(
                            onClick = { currentStep -= 1 },
                            border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Previous", color = SlateLight)
                        }
                    }

                    Button(
                        onClick = {
                            if (currentStep < steps.size - 1) {
                                currentStep += 1
                            } else {
                                onDismiss()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SafetyTeal),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = if (currentStep < steps.size - 1) "Next Step" else "Got It & Ready",
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

private data class TutorialStep(
    val title: String,
    val audioScript: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val iconTint: Color
)
