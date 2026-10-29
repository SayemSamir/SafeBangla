package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Language
import com.example.data.model.UserRole
import com.example.ui.components.TechnicalSpecsSheet
import com.example.ui.components.VoiceTutorialDialog
import com.example.ui.screens.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: SafeBanglaViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                SafeBanglaApp(viewModel = viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SafeBanglaApp(viewModel: SafeBanglaViewModel) {
    val currentRole by viewModel.currentRole.collectAsState()
    val language by viewModel.language.collectAsState()
    val isBlackout by viewModel.isBlackoutMode.collectAsState()
    val selectedTab by viewModel.selectedTab.collectAsState()
    val showTechSpecs by viewModel.showTechSpecs.collectAsState()
    val showVoiceTutorial by viewModel.showVoiceTutorial.collectAsState()
    val isEasyMode by viewModel.isEasyAccessibleMode.collectAsState()
    val covertShakeNotice by viewModel.covertShakeTriggerNotice.collectAsState()

    var showRoleDropdown by remember { mutableStateOf(false) }

    val citizenTabs = listOf(
        "SOS & Radar" to Icons.Default.Warning,
        "Live News & Hazards" to Icons.Default.Campaign,
        "Family Radar" to Icons.Default.FamilyRestroom,
        "Shelter Queue" to Icons.Default.QrCode2,
        "Honours & XP" to Icons.Default.MilitaryTech,
        "Shelters" to Icons.Default.HolidayVillage,
        "Hospitals" to Icons.Default.LocalHospital,
        "AI Assistant" to Icons.Default.SmartToy,
        "BLE Mesh" to Icons.Default.BluetoothSearching,
        "Hazard Map" to Icons.Default.AddLocationAlt,
        "Drone Fleet" to Icons.Default.Flight,
        "IoT Gauges" to Icons.Default.Waves
    )

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateDark),
        contentWindowInsets = WindowInsets.safeDrawing,
        topBar = {
            Column {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(EmergencyRed)
                                    .border(1.dp, Color.White.copy(alpha = 0.8f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Shield,
                                    contentDescription = "SafeBangla Logo",
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "SafeBangla",
                                        fontSize = 17.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(if (isBlackout) WarningYellow else BengalGreen)
                                    )
                                }
                                Text(
                                    text = if (language == Language.BANGLA) "স্মার্ট দুর্যোগ ব্যবস্থাপনা" else "Smart Disaster Response",
                                    fontSize = 10.sp,
                                    color = SlateMuted
                                )
                            }
                        }
                    },
                    actions = {
                        // Accessible 1-Tap Mode Toggle Button
                        IconButton(
                            onClick = { viewModel.toggleEasyAccessibleMode() },
                            modifier = Modifier.testTag("easy_mode_toggle_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.AccessibilityNew,
                                contentDescription = "Toggle Easy Mode",
                                tint = if (isEasyMode) WarningYellow else SlateLight
                            )
                        }

                        // Blackout Mode Quick Toggle Button
                        IconButton(
                            onClick = { viewModel.toggleBlackoutMode() },
                            modifier = Modifier.testTag("top_blackout_toggle")
                        ) {
                            Icon(
                                imageVector = if (isBlackout) Icons.Default.WifiOff else Icons.Default.Wifi,
                                contentDescription = "Toggle Blackout Mode",
                                tint = if (isBlackout) WarningYellow else SafetyCyan
                            )
                        }

                        // Language Switcher (ENG / বাংলা)
                        TextButton(
                            onClick = { viewModel.toggleLanguage() },
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp),
                            modifier = Modifier.testTag("language_toggle_button")
                        ) {
                            Text(
                                text = if (language == Language.BANGLA) "বাং" else "EN",
                                color = SafetyCyan,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Role Switcher Chip / Menu
                        Box {
                            Surface(
                                color = when (currentRole) {
                                    UserRole.CITIZEN -> EmergencyRedDark
                                    UserRole.VOLUNTEER -> SafetyTeal
                                    UserRole.RESCUE_TEAM -> HazardOrange
                                    UserRole.ADMIN -> SlateCardElevated
                                },
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .clickable { showRoleDropdown = true }
                                    .testTag("role_switcher_button")
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = currentRole.displayName,
                                        color = Color.White,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Icon(
                                        Icons.Default.ArrowDropDown,
                                        contentDescription = "Select Role",
                                        tint = Color.White,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }

                            DropdownMenu(
                                expanded = showRoleDropdown,
                                onDismissRequest = { showRoleDropdown = false },
                                modifier = Modifier.background(SlateSurface)
                            ) {
                                UserRole.entries.forEach { role ->
                                    DropdownMenuItem(
                                        text = {
                                            Column {
                                                Text(
                                                    text = role.displayName,
                                                    color = if (role == currentRole) SafetyCyan else Color.White,
                                                    fontWeight = if (role == currentRole) FontWeight.Bold else FontWeight.Normal
                                                )
                                                Text(
                                                    text = role.banglaName,
                                                    color = SlateMuted,
                                                    fontSize = 10.sp
                                                )
                                            }
                                        },
                                        onClick = {
                                            viewModel.setRole(role)
                                            showRoleDropdown = false
                                        }
                                    )
                                }
                            }
                        }

                        // System Architecture Specs Sheet
                        IconButton(
                            onClick = { viewModel.toggleTechSpecsDialog(true) },
                            modifier = Modifier.testTag("open_tech_specs_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Terminal,
                                contentDescription = "View System Specs",
                                tint = SlateLight
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = SlateDark
                    )
                )

                // Horizontal Tab Strip for Citizen features
                if (currentRole == UserRole.CITIZEN && !isEasyMode) {
                    ScrollableTabRow(
                        selectedTabIndex = selectedTab,
                        containerColor = SlateSurface,
                        contentColor = SafetyCyan,
                        edgePadding = 12.dp,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        citizenTabs.forEachIndexed { index, (title, icon) ->
                            Tab(
                                selected = selectedTab == index,
                                onClick = { viewModel.setTab(index) },
                                text = {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(icon, contentDescription = null, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            )
                        }
                    }
                }
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = SlateSurface,
                contentColor = SafetyCyan,
                modifier = Modifier
                    .navigationBarsPadding()
                    .testTag("main_navigation_bar")
            ) {
                NavigationBarItem(
                    selected = currentRole == UserRole.CITIZEN,
                    onClick = { viewModel.setRole(UserRole.CITIZEN) },
                    icon = { Icon(Icons.Default.Person, contentDescription = "Citizen Mode") },
                    label = { Text("Citizen App", fontSize = 10.sp) },
                    colors = navItemColors()
                )
                NavigationBarItem(
                    selected = currentRole == UserRole.VOLUNTEER,
                    onClick = { viewModel.setRole(UserRole.VOLUNTEER) },
                    icon = { Icon(Icons.Default.VolunteerActivism, contentDescription = "Volunteer") },
                    label = { Text("Volunteer", fontSize = 10.sp) },
                    colors = navItemColors()
                )
                NavigationBarItem(
                    selected = currentRole == UserRole.RESCUE_TEAM,
                    onClick = { viewModel.setRole(UserRole.RESCUE_TEAM) },
                    icon = { Icon(Icons.Default.DirectionsBoat, contentDescription = "Rescue Team") },
                    label = { Text("Rescue Team", fontSize = 10.sp) },
                    colors = navItemColors()
                )
                NavigationBarItem(
                    selected = currentRole == UserRole.ADMIN,
                    onClick = { viewModel.setRole(UserRole.ADMIN) },
                    icon = { Icon(Icons.Default.AdminPanelSettings, contentDescription = "Admin") },
                    label = { Text("Command Ops", fontSize = 10.sp) },
                    colors = navItemColors()
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentRole) {
                UserRole.CITIZEN -> {
                    when (selectedTab) {
                        0 -> CitizenScreen(viewModel = viewModel)
                        1 -> DisasterNewsScreen(viewModel = viewModel)
                        2 -> FamilySafetyScreen(viewModel = viewModel)
                        3 -> ShelterQueueScreen(viewModel = viewModel)
                        4 -> VolunteerLeaderboardScreen(viewModel = viewModel)
                        5 -> SheltersScreen(viewModel = viewModel)
                        6 -> HospitalsScreen(viewModel = viewModel)
                        7 -> AiAssistantScreen(viewModel = viewModel)
                        8 -> BleMeshScreen(viewModel = viewModel)
                        9 -> HazardMappingScreen(viewModel = viewModel)
                        10 -> DroneFleetScreen(viewModel = viewModel)
                        11 -> WaterSensorsScreen(viewModel = viewModel)
                        else -> CitizenScreen(viewModel = viewModel)
                    }
                }
                UserRole.VOLUNTEER -> VolunteerScreen(viewModel = viewModel)
                UserRole.RESCUE_TEAM -> RescueTeamScreen(viewModel = viewModel)
                UserRole.ADMIN -> AdminDashboardScreen(viewModel = viewModel)
            }
        }
    }

    TechnicalSpecsSheet(
        isOpen = showTechSpecs,
        onDismiss = { viewModel.toggleTechSpecsDialog(false) }
    )

    VoiceTutorialDialog(
        isOpen = showVoiceTutorial,
        language = language,
        onDismiss = { viewModel.setShowVoiceTutorial(false) }
    )
}

@Composable
private fun navItemColors() = NavigationBarItemDefaults.colors(
    selectedIconColor = Color.White,
    selectedTextColor = SafetyCyan,
    unselectedIconColor = SlateMuted,
    unselectedTextColor = SlateMuted,
    indicatorColor = EmergencyRed
)
