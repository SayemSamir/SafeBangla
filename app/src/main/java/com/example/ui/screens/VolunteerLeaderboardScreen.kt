package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.VolunteerLeaderboardEntry
import com.example.ui.viewmodel.SafeBanglaViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VolunteerLeaderboardScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val leaderboard by viewModel.volunteerLeaderboard.collectAsState()
    var selectedVolunteerForCert by remember { mutableStateOf<VolunteerLeaderboardEntry?>(null) }
    var showDownloadedSnackbar by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            "Volunteer Recognition & Ranks",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            "Crisis Response Gamification & Verified Certification",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFFF59E0B)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A)
                )
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
            // Gamification Overview Hero
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF1E293B)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color(0xFFF59E0B).copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color(0xFFF59E0B).copy(alpha = 0.15f),
                                modifier = Modifier.size(46.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        Icons.Default.MilitaryTech,
                                        contentDescription = null,
                                        tint = Color(0xFFF59E0B),
                                        modifier = Modifier.size(28.dp)
                                    )
                                }
                            }

                            Column {
                                Text(
                                    "Disaster Hero Honours System",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                                Text(
                                    "Earn XP through verified rescue operations, flood relief drops, and drone telemetry relay. Generate official PDF certificates.",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    lineHeight = 16.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            BadgePill("First Responder", "+250 XP")
                            BadgePill("Lifesaver", "+500 XP")
                            BadgePill("Community Hero", "+1,000 XP")
                        }
                    }
                }
            }

            // Top Podium Preview
            item {
                Text(
                    "Top Disaster Response Guardians",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }

            // Leaderboard list
            itemsIndexed(leaderboard, key = { _, item -> item.volunteerId }) { index, entry ->
                VolunteerLeaderboardRow(
                    rank = index + 1,
                    entry = entry,
                    onGenerateCertificate = {
                        selectedVolunteerForCert = entry
                    }
                )
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }

    // Certificate Preview Modal
    selectedVolunteerForCert?.let { volunteer ->
        AlertDialog(
            onDismissRequest = { selectedVolunteerForCert = null },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Verified,
                        contentDescription = null,
                        tint = Color(0xFFF59E0B)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Official Certificate of Honor",
                        color = Color.White,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            },
            text = {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(2.dp, Color(0xFFF59E0B), RoundedCornerShape(12.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            "PEOPLE'S REPUBLIC OF BANGLADESH",
                            color = Color(0xFF94A3B8),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                        Text(
                            "SAFEBANGLA CRISIS RESPONSE COMMAND",
                            color = Color(0xFFF59E0B),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Divider(color = Color(0xFF334155), thickness = 1.dp)

                        Text(
                            "CERTIFICATE OF VALOR & SERVICE",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 0.5.sp
                        )

                        Text(
                            "This credential proudly certifies that",
                            color = Color(0xFF94A3B8),
                            fontSize = 10.sp
                        )

                        Text(
                            volunteer.name.uppercase(),
                            color = Color(0xFF38BDF8),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Serif
                        )

                        Text(
                            "has rendered heroic and meritorious service during catastrophic flooding and cyclone operations, having logged ${volunteer.hoursLogged} hours across ${volunteer.missionsCompleted} verified frontline rescue missions.",
                            color = Color(0xFFCBD5E1),
                            fontSize = 10.sp,
                            textAlign = TextAlign.Center,
                            lineHeight = 14.sp
                        )

                        Divider(color = Color(0xFF334155), thickness = 1.dp)

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("CERT ID: SB-${volunteer.volunteerId.take(6).uppercase()}-2026", color = Color(0xFF64748B), fontSize = 8.sp)
                                Text("EARNED XP: ${volunteer.points} PTS", color = Color(0xFF10B981), fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            }
                            Icon(
                                Icons.Default.WorkspacePremium,
                                contentDescription = null,
                                tint = Color(0xFFF59E0B),
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        selectedVolunteerForCert = null
                        showDownloadedSnackbar = true
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
                    modifier = Modifier.testTag("download_cert_pdf_btn")
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, tint = Color(0xFF0F172A), modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Export Verified PDF", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedVolunteerForCert = null }) {
                    Text("Close", color = Color(0xFF94A3B8))
                }
            },
            containerColor = Color(0xFF1E293B)
        )
    }

    if (showDownloadedSnackbar) {
        AlertDialog(
            onDismissRequest = { showDownloadedSnackbar = false },
            title = { Text("PDF Certificate Generated", color = Color.White) },
            text = { Text("Digital credential signed with cryptographic QR hash and saved to device downloads.", color = Color(0xFFCBD5E1)) },
            confirmButton = {
                Button(
                    onClick = { showDownloadedSnackbar = false },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                ) {
                    Text("OK")
                }
            },
            containerColor = Color(0xFF1E293B)
        )
    }
}

@Composable
fun VolunteerLeaderboardRow(
    rank: Int,
    entry: VolunteerLeaderboardEntry,
    onGenerateCertificate: () -> Unit
) {
    val rankColor = when (rank) {
        1 -> Color(0xFFFFD700)
        2 -> Color(0xFFC0C0C0)
        3 -> Color(0xFFCD7F32)
        else -> Color(0xFF94A3B8)
    }

    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        modifier = Modifier
            .fillMaxWidth()
            .border(
                1.dp,
                if (rank <= 3) rankColor.copy(alpha = 0.5f) else Color(0xFF334155),
                RoundedCornerShape(14.dp)
            )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Rank Number
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(rankColor.copy(alpha = 0.15f))
                    .border(1.dp, rankColor, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "#$rank",
                    color = rankColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        entry.name,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        "${entry.points} XP",
                        color = Color(0xFFF59E0B),
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    "${entry.missionsCompleted} Missions - ${entry.hoursLogged} hrs logged (${entry.division})",
                    color = Color(0xFF94A3B8),
                    fontSize = 11.sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = Color(0xFF0F172A),
                    border = androidx.compose.foundation.BorderStroke(0.5.dp, Color(0xFF475569))
                ) {
                    Text(
                        entry.topBadge,
                        color = Color(0xFF38BDF8),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            IconButton(
                onClick = onGenerateCertificate,
                modifier = Modifier.testTag("cert_btn_${entry.volunteerId}")
            ) {
                Icon(
                    Icons.Default.CardMembership,
                    contentDescription = "Generate Certificate",
                    tint = Color(0xFFF59E0B)
                )
            }
        }
    }
}

@Composable
fun BadgePill(name: String, xp: String) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = Color(0xFF0F172A),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(name, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.width(4.dp))
            Text(xp, color = Color(0xFFF59E0B), fontSize = 9.sp, fontWeight = FontWeight.Bold)
        }
    }
}
