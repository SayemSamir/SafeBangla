package com.example.ui.screens

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
import com.example.data.model.Shelter
import com.example.data.model.ShelterStatus
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

@Composable
fun SheltersScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val shelters by viewModel.shelters.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf<ShelterStatus?>(null) }

    val filteredShelters = remember(shelters, searchQuery, selectedFilter) {
        shelters.filter { shelter ->
            val matchesQuery = searchQuery.isBlank() ||
                    shelter.name.contains(searchQuery, ignoreCase = true) ||
                    shelter.banglaName.contains(searchQuery, ignoreCase = true) ||
                    shelter.district.contains(searchQuery, ignoreCase = true)

            val matchesFilter = selectedFilter == null || shelter.status == selectedFilter
            matchesQuery && matchesFilter
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(SlateDark)
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        // Title and Live Counter
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = if (language == Language.BANGLA) "নিরাপদ সাইক্লোন ও বন্যা আশ্রয়কেন্দ্র" else "Safe Shelter Finder",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = if (language == Language.BANGLA) "সরাসরি ধারণক্ষমতা ও সুবিধা ট্র্যাকিং" else "Live Occupancy & Amenities Monitor",
                    fontSize = 12.sp,
                    color = SlateMuted
                )
            }

            Surface(
                color = BengalGreen.copy(alpha = 0.2f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "${shelters.size} SHELTERS",
                    color = BengalGreen,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search by district or shelter name...", color = SlateMuted, fontSize = 13.sp) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = SafetyCyan) },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { searchQuery = "" }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear", tint = SlateMuted)
                    }
                }
            },
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = SlateSurface,
                unfocusedContainerColor = SlateSurface,
                focusedBorderColor = SafetyCyan,
                unfocusedBorderColor = SlateBorder,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("shelter_search_input")
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Filter chips (All, Available, Filling Fast, Full)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            FilterChip(
                selected = selectedFilter == null,
                onClick = { selectedFilter = null },
                label = { Text("All", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = SafetyTeal,
                    selectedLabelColor = Color.White
                )
            )
            FilterChip(
                selected = selectedFilter == ShelterStatus.AVAILABLE,
                onClick = { selectedFilter = ShelterStatus.AVAILABLE },
                label = { Text("Available (Green)", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = BengalGreen,
                    selectedLabelColor = Color.White
                )
            )
            FilterChip(
                selected = selectedFilter == ShelterStatus.FILLING_FAST,
                onClick = { selectedFilter = ShelterStatus.FILLING_FAST },
                label = { Text("Filling Fast", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = WarningYellow,
                    selectedLabelColor = Color.Black
                )
            )
            FilterChip(
                selected = selectedFilter == ShelterStatus.FULL,
                onClick = { selectedFilter = ShelterStatus.FULL },
                label = { Text("Full", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = EmergencyRed,
                    selectedLabelColor = Color.White
                )
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Shelters List
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(bottom = 20.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredShelters, key = { it.id }) { shelter ->
                ShelterItemCard(
                    shelter = shelter,
                    language = language,
                    onNavigate = {
                        viewModel.openNavigationMap(shelter.latitude, shelter.longitude, shelter.name)
                    },
                    onCall = { viewModel.openDialer(shelter.contactPhone) }
                )
            }
        }
    }
}

@Composable
fun ShelterItemCard(
    shelter: Shelter,
    language: Language,
    onNavigate: () -> Unit,
    onCall: () -> Unit
) {
    val statusColor = when (shelter.status) {
        ShelterStatus.AVAILABLE -> BengalGreen
        ShelterStatus.FILLING_FAST -> WarningYellow
        ShelterStatus.FULL -> EmergencyRed
    }

    val statusText = when (shelter.status) {
        ShelterStatus.AVAILABLE -> if (language == Language.BANGLA) "স্থান খালি আছে" else "Available"
        ShelterStatus.FILLING_FAST -> if (language == Language.BANGLA) "দ্রুত পূর্ণ হচ্ছে" else "Filling Fast"
        ShelterStatus.FULL -> if (language == Language.BANGLA) "সম্পূর্ণ পূর্ণ" else "Capacity Full"
    }

    val occupancyPct = (shelter.currentOccupancy.toFloat() / shelter.totalCapacity.toFloat()).coerceIn(0f, 1f)

    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("shelter_card_${shelter.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = if (language == Language.BANGLA) shelter.banglaName else shelter.name,
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${shelter.district} • ${shelter.distanceKm} km away",
                        color = SlateMuted,
                        fontSize = 12.sp
                    )
                }

                Surface(
                    color = statusColor.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, statusColor)
                ) {
                    Text(
                        text = statusText,
                        color = statusColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Capacity Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Occupancy: ${shelter.currentOccupancy} / ${shelter.totalCapacity} people",
                    color = SlateLight,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "${(occupancyPct * 100).toInt()}%",
                    color = statusColor,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            LinearProgressIndicator(
                progress = { occupancyPct },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(7.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = statusColor,
                trackColor = SlateCardElevated
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Amenities Tags
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                if (shelter.hasCleanWater) AmenityBadge(icon = Icons.Default.WaterDrop, label = "Clean Water", color = SafetyCyan)
                if (shelter.hasFoodSupply) AmenityBadge(icon = Icons.Default.Restaurant, label = "Dry Rations", color = WarningYellow)
                if (shelter.hasMedicalFirstAid) AmenityBadge(icon = Icons.Default.Medication, label = "First Aid", color = EmergencyRedGlow)
                if (shelter.hasPowerGenerator) AmenityBadge(icon = Icons.Default.Bolt, label = "Generator", color = BengalGreen)
                if (shelter.hasBoatDock) AmenityBadge(icon = Icons.Default.DirectionsBoat, label = "Boat Dock", color = SafetyTeal)
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Navigation and Call Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onNavigate,
                    colors = ButtonDefaults.buttonColors(containerColor = SafetyTeal),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Navigation, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (language == Language.BANGLA) "ম্যাপ ডিরেকশন" else "GPS Navigation",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                OutlinedButton(
                    onClick = onCall,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(16.dp), tint = SafetyCyan)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (language == Language.BANGLA) "হেল্পলাইন কল" else "Call Shelter",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

@Composable
private fun AmenityBadge(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    color: Color
) {
    Surface(
        color = color.copy(alpha = 0.15f),
        shape = RoundedCornerShape(6.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = color, modifier = Modifier.size(11.dp))
            Spacer(modifier = Modifier.width(3.dp))
            Text(text = label, color = color, fontSize = 9.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}
