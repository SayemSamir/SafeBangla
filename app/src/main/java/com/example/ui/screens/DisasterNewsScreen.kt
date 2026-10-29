package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.Image
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
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.data.model.DisasterAlert
import com.example.data.model.HazardReport
import com.example.data.model.Language
import com.example.data.model.Severity
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun DisasterNewsScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val disasterAlerts by viewModel.disasterAlerts.collectAsState()
    val hazardReports by viewModel.hazardReports.collectAsState()

    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf(
        if (language == Language.BANGLA) "সরকারি সতর্কবার্তা" else "Official Alerts (BMD)",
        if (language == Language.BANGLA) "নাগরিক বিপদ ফিড" else "Community Hazards"
    )

    var currentlyPlayingTtsId by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        // Glassmorphic Header & Weather Ticker
        GlassmorphicContainer(
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(EmergencyRedDark),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Campaign, contentDescription = null, tint = WarningYellow, modifier = Modifier.size(20.dp))
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "LIVE WEATHER RADAR TICKER • BMD BULLETIN #14",
                        color = WarningYellow,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = if (language == Language.BANGLA)
                            "ঘূর্ণিঝড় 'মনি': পায়রা ও মোংলা সমুদ্রবন্দরকে ৮ নম্বর এবং চট্টগ্রাম ও কক্সবাজারকে ১০ নম্বর মহাবিপদ সংকেত দেখাতে বলা হয়েছে।"
                        else
                            "Cyclone 'Moni': Great Danger Signal 10 hoisted for Chittagong & Cox's Bazar. Wind gusts 140 km/h.",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        lineHeight = 15.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Glassmorphic TabBar
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = Color(0x331E293B),
            contentColor = SafetyCyan,
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                    color = SafetyCyan
                )
            },
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .border(1.dp, Color(0x3394A3B8), RoundedCornerShape(12.dp))
        ) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = {
                        Text(
                            text = title,
                            fontSize = 12.sp,
                            fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal,
                            color = if (selectedTab == index) Color.White else SlateMuted
                        )
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Tab Content
        if (selectedTab == 0) {
            // Tab 1: Official BMD / Government Alerts
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                contentPadding = PaddingValues(bottom = 20.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(disasterAlerts, key = { it.id }) { alert ->
                    OfficialAlertGlassCard(
                        alert = alert,
                        language = language,
                        isPlayingTts = currentlyPlayingTtsId == alert.id,
                        onPlayTts = {
                            if (currentlyPlayingTtsId == alert.id) {
                                currentlyPlayingTtsId = null
                            } else {
                                currentlyPlayingTtsId = alert.id
                                coroutineScope.launch {
                                    delay(4000)
                                    if (currentlyPlayingTtsId == alert.id) {
                                        currentlyPlayingTtsId = null
                                    }
                                }
                            }
                        }
                    )
                }
            }
        } else {
            // Tab 2: Community Hazards Feed
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                contentPadding = PaddingValues(bottom = 20.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(hazardReports, key = { it.id }) { report ->
                    CommunityHazardGlassCard(
                        report = report,
                        language = language,
                        isPlayingTts = currentlyPlayingTtsId == report.id,
                        onPlayTts = {
                            if (currentlyPlayingTtsId == report.id) {
                                currentlyPlayingTtsId = null
                            } else {
                                currentlyPlayingTtsId = report.id
                                coroutineScope.launch {
                                    delay(3500)
                                    if (currentlyPlayingTtsId == report.id) {
                                        currentlyPlayingTtsId = null
                                    }
                                }
                            }
                        },
                        onUpvote = { viewModel.upvoteHazard(report.id) },
                        onDownvote = { viewModel.downvoteHazard(report.id) },
                        onNavigate = { viewModel.openNavigationMap(report.latitude, report.longitude, report.title) }
                    )
                }
            }
        }
    }
}

@Composable
fun GlassmorphicContainer(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        Color(0x3D1E293B),
                        Color(0x1F0F172A)
                    )
                )
            )
            .border(
                width = 1.dp,
                brush = Brush.linearGradient(
                    colors = listOf(
                        Color(0x4D38BDF8),
                        Color(0x1A94A3B8)
                    )
                ),
                shape = RoundedCornerShape(16.dp)
            )
    ) {
        content()
    }
}

@Composable
private fun OfficialAlertGlassCard(
    alert: DisasterAlert,
    language: Language,
    isPlayingTts: Boolean,
    onPlayTts: () -> Unit
) {
    GlassmorphicContainer(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Hero Image Attachment
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.Black)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.safebangla_hero_1793041221658),
                    contentDescription = "Cyclone Radar",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                Surface(
                    color = Color.Black.copy(alpha = 0.65f),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(8.dp)
                ) {
                    Text(
                        text = "BMD OFFICIAL BULLETIN",
                        color = WarningYellow,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = EmergencyRedDark.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(6.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, EmergencyRedGlow)
                ) {
                    Text(
                        text = alert.signalLevel,
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Text(
                    text = alert.issuedAt,
                    color = SlateMuted,
                    fontSize = 10.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = if (language == Language.BANGLA) alert.banglaTitle else alert.title,
                color = Color.White,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = if (language == Language.BANGLA) alert.banglaDescription else alert.description,
                color = SlateLight,
                fontSize = 12.sp,
                lineHeight = 16.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            // TTS Audio Button & Regions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = SafetyCyan, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = alert.affectedRegions.take(3).joinToString(", "),
                        color = SafetyCyan,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Bangla / English TTS Audio Playback Button
                FilledTonalButton(
                    onClick = onPlayTts,
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = if (isPlayingTts) BengalGreenDark else Color(0x33334155),
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)
                ) {
                    Icon(
                        imageVector = if (isPlayingTts) Icons.Default.VolumeUp else Icons.Default.SpatialAudio,
                        contentDescription = "Text to Speech",
                        modifier = Modifier.size(16.dp),
                        tint = if (isPlayingTts) BengalGreen else Color.White
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (isPlayingTts) "Speaking Bangla..." else "Bangla TTS",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun CommunityHazardGlassCard(
    report: HazardReport,
    language: Language,
    isPlayingTts: Boolean,
    onPlayTts: () -> Unit,
    onUpvote: () -> Unit,
    onDownvote: () -> Unit,
    onNavigate: () -> Unit
) {
    GlassmorphicContainer(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(if (report.urgency == Severity.CRITICAL) EmergencyRedDark else HazardOrange.copy(alpha = 0.3f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = when (report.category.name) {
                                "FALLEN_ELECTRIC_WIRE" -> Icons.Default.ElectricBolt
                                "EMBANKMENT_BREACH" -> Icons.Default.Waves
                                else -> Icons.Default.Warning
                            },
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (language == Language.BANGLA) report.category.banglaLabel else report.category.label,
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (report.isVerifiedByAuthority) {
                    Surface(
                        color = BengalGreenDark.copy(alpha = 0.4f),
                        shape = RoundedCornerShape(4.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BengalGreen)
                    ) {
                        Text(
                            text = "VERIFIED",
                            color = BengalGreen,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = if (language == Language.BANGLA) report.banglaTitle else report.title,
                color = Color.White,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(modifier = Modifier.height(4.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Place, contentDescription = null, tint = SlateMuted, modifier = Modifier.size(12.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "${report.locationName} • Reported by ${report.reporterName}",
                    color = SlateMuted,
                    fontSize = 10.sp
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action row: Upvote / Downvote and Bangla TTS Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilledTonalButton(
                        onClick = onUpvote,
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = if (report.userVotedUp) SafetyTeal else Color(0x33334155)
                        ),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Icon(Icons.Default.ThumbUp, contentDescription = null, modifier = Modifier.size(13.dp), tint = Color.White)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("${report.upvotes}", fontSize = 11.sp, color = Color.White)
                    }

                    FilledTonalButton(
                        onClick = onDownvote,
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = if (report.userVotedDown) EmergencyRedDark else Color(0x33334155)
                        ),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Icon(Icons.Default.ThumbDown, contentDescription = null, modifier = Modifier.size(13.dp), tint = SlateLight)
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilledTonalButton(
                        onClick = onPlayTts,
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = if (isPlayingTts) BengalGreenDark else Color(0x33334155)
                        ),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Icon(
                            imageVector = if (isPlayingTts) Icons.Default.VolumeUp else Icons.Default.Campaign,
                            contentDescription = "TTS Voice",
                            modifier = Modifier.size(14.dp),
                            tint = if (isPlayingTts) BengalGreen else Color.White
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(if (isPlayingTts) "Playing..." else "TTS", fontSize = 10.sp, color = Color.White)
                    }

                    IconButton(
                        onClick = onNavigate,
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(Color(0x33334155))
                    ) {
                        Icon(Icons.Default.Navigation, contentDescription = "Navigate", tint = SafetyCyan, modifier = Modifier.size(14.dp))
                    }
                }
            }
        }
    }
}
