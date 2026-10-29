package com.example.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Shelter
import com.example.data.model.ShelterToken
import com.example.ui.viewmodel.SafeBanglaViewModel
import java.util.Random

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShelterQueueScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val shelters by viewModel.shelters.collectAsState()
    val issuedTokens by viewModel.shelterTokens.collectAsState()
    val latestToken by viewModel.latestIssuedToken.collectAsState()
    var selectedShelterForToken by remember { mutableStateOf<Shelter?>(null) }
    var citizenNameInput by remember { mutableStateOf("Tanvir Rahman") }
    var showTokenDialog by remember { mutableStateOf(false) }

    LaunchedEffect(latestToken) {
        if (latestToken != null) {
            showTokenDialog = true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            "Shelter Virtual Queue",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            "Smart Load Balancer (90% Auto-Reroute Protection)",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF38BDF8)
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
            // Smart Load Balancer Explanation Card
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF1E293B)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color(0xFF38BDF8).copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFF38BDF8).copy(alpha = 0.15f),
                            modifier = Modifier.size(44.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Default.QrCode2,
                                    contentDescription = null,
                                    tint = Color(0xFF38BDF8)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column {
                            Text(
                                "Digital Queue & Entry Tokens",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Text(
                                "If a cyclone shelter reaches >= 90% capacity, our automated balancing algorithm recalculates and reroutes incoming families to the nearest open facility.",
                                color = Color(0xFF94A3B8),
                                fontSize = 11.sp,
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }

            // My Active Tokens Section
            if (issuedTokens.isNotEmpty()) {
                item {
                    Text(
                        "Your Digital Entry Pass (${issuedTokens.size})",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }

                items(issuedTokens, key = { it.tokenId }) { token ->
                    TokenSummaryCard(token = token)
                }
            }

            // Available Shelters
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Nearby Shelters & Live Load",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        "${shelters.size} monitored",
                        color = Color(0xFF64748B),
                        fontSize = 12.sp
                    )
                }
            }

            items(shelters, key = { it.id }) { shelter ->
                ShelterQueueItemCard(
                    shelter = shelter,
                    onRequestToken = {
                        selectedShelterForToken = shelter
                    }
                )
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }

    // Modal for requesting token
    selectedShelterForToken?.let { shelter ->
        val loadRatio = shelter.currentOccupancy.toFloat() / shelter.totalCapacity.coerceAtLeast(1)
        val isOvercrowded = loadRatio >= 0.90f

        AlertDialog(
            onDismissRequest = { selectedShelterForToken = null },
            title = {
                Text(
                    "Request Entry Token",
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        "Selected: ${shelter.name}",
                        color = Color(0xFF38BDF8),
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        "Current Load: ${shelter.currentOccupancy}/${shelter.totalCapacity} (${(loadRatio * 100).toInt()}%)",
                        color = if (isOvercrowded) Color(0xFFEF4444) else Color(0xFFCBD5E1),
                        fontSize = 13.sp
                    )
                    if (isOvercrowded) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFFEF4444).copy(alpha = 0.15f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEF4444).copy(alpha = 0.4f))
                        ) {
                            Text(
                                "Notice: This shelter is at >=90% capacity! The smart load balancer will assign you to the nearest optimal alternative shelter.",
                                color = Color(0xFFFCA5A5),
                                fontSize = 11.sp,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }

                    OutlinedTextField(
                        value = citizenNameInput,
                        onValueChange = { citizenNameInput = it },
                        label = { Text("Citizen / Family Name") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF38BDF8),
                            unfocusedBorderColor = Color(0xFF475569),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("citizen_name_input")
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.bookSmartShelterToken(shelter.id, citizenNameInput.ifBlank { "Citizen" })
                        selectedShelterForToken = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF38BDF8)),
                    modifier = Modifier.testTag("confirm_book_token_btn")
                ) {
                    Text("Issue Dynamic Token", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedShelterForToken = null }) {
                    Text("Cancel", color = Color(0xFF94A3B8))
                }
            },
            containerColor = Color(0xFF1E293B)
        )
    }

    // Modal when token is issued
    if (showTokenDialog && latestToken != null) {
        val token = latestToken!!
        AlertDialog(
            onDismissRequest = {
                showTokenDialog = false
                viewModel.dismissLatestToken()
            },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        if (token.isRedirectedDueToLoad) Icons.Default.AltRoute else Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = if (token.isRedirectedDueToLoad) Color(0xFFF59E0B) else Color(0xFF10B981)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        if (token.isRedirectedDueToLoad) "Smart Load Balanced!" else "Entry Token Issued!",
                        color = Color.White,
                        fontSize = 18.sp
                    )
                }
            },
            text = {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (token.isRedirectedDueToLoad) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFFF59E0B).copy(alpha = 0.15f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.5f))
                        ) {
                            Text(
                                token.redirectReason ?: "Overcrowding Prevented: Redirected to ${token.shelterName}",
                                color = Color(0xFFFDE68A),
                                fontSize = 11.sp,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }

                    // QR Code Canvas Simulation
                    DynamicQrCodeCanvas(
                        seed = token.tokenId.hashCode(),
                        modifier = Modifier
                            .size(170.dp)
                            .background(Color.White, RoundedCornerShape(12.dp))
                            .padding(8.dp)
                    )

                    Text(
                        "TOKEN #${token.queueNumber} - ${token.tokenId.take(8).uppercase()}",
                        color = Color(0xFF38BDF8),
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )

                    Text(
                        token.shelterName,
                        color = Color.White,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 14.sp
                    )

                    Text(
                        "Allotted: ${token.allottedZone} - Issued ${token.issuedAt}",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showTokenDialog = false
                        viewModel.dismissLatestToken()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF38BDF8))
                ) {
                    Text("Save to My Passes", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
                }
            },
            containerColor = Color(0xFF1E293B)
        )
    }
}

@Composable
fun ShelterQueueItemCard(
    shelter: Shelter,
    onRequestToken: () -> Unit
) {
    val loadRatio = shelter.currentOccupancy.toFloat() / shelter.totalCapacity.coerceAtLeast(1)
    val occupancyPercent = (loadRatio * 100).toInt()
    val isOvercrowded = loadRatio >= 0.90f

    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B)
        ),
        modifier = Modifier
            .fillMaxWidth()
            .border(
                1.dp,
                if (isOvercrowded) Color(0xFFEF4444).copy(alpha = 0.6f) else Color(0xFF334155),
                RoundedCornerShape(14.dp)
            )
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        shelter.name,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Text(
                        "${shelter.banglaName} - ${shelter.district}",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isOvercrowded) Color(0xFFEF4444).copy(alpha = 0.2f) else Color(0xFF10B981).copy(alpha = 0.2f)
                ) {
                    Text(
                        if (isOvercrowded) ">= 90% FULL" else "AVAILABLE",
                        color = if (isOvercrowded) Color(0xFFEF4444) else Color(0xFF10B981),
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            // Capacity Progress Bar
            Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "Occupancy: ${shelter.currentOccupancy} / ${shelter.totalCapacity}",
                        color = Color(0xFFCBD5E1),
                        fontSize = 11.sp
                    )
                    Text(
                        "$occupancyPercent%",
                        color = if (isOvercrowded) Color(0xFFEF4444) else Color(0xFF38BDF8),
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp
                    )
                }

                LinearProgressIndicator(
                    progress = { loadRatio.coerceIn(0f, 1f) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp),
                    color = if (isOvercrowded) Color(0xFFEF4444) else Color(0xFF10B981),
                    trackColor = Color(0xFF334155),
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    if (isOvercrowded) "Auto-reroutes to backup shelter" else "Instant QR token available",
                    color = if (isOvercrowded) Color(0xFFF59E0B) else Color(0xFF64748B),
                    fontSize = 11.sp
                )

                Button(
                    onClick = onRequestToken,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isOvercrowded) Color(0xFFF59E0B) else Color(0xFF38BDF8)
                    ),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("request_token_btn_${shelter.id}")
                ) {
                    Icon(
                        Icons.Default.QrCode,
                        contentDescription = null,
                        tint = Color(0xFF0F172A),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        "Get Digital Pass",
                        color = Color(0xFF0F172A),
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}

@Composable
fun TokenSummaryCard(token: ShelterToken) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF38BDF8).copy(alpha = 0.5f), RoundedCornerShape(14.dp))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            DynamicQrCodeCanvas(
                seed = token.tokenId.hashCode(),
                modifier = Modifier
                    .size(64.dp)
                    .background(Color.White, RoundedCornerShape(8.dp))
                    .padding(4.dp)
            )

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "Queue #${token.queueNumber}",
                        color = Color(0xFF38BDF8),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    if (token.isRedirectedDueToLoad) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = Color(0xFFF59E0B).copy(alpha = 0.2f)
                        ) {
                            Text(
                                "Rerouted",
                                color = Color(0xFFF59E0B),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
                Text(
                    token.shelterName,
                    color = Color.White,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 13.sp
                )
                Text(
                    "Zone: ${token.allottedZone} - For ${token.citizenName}",
                    color = Color(0xFF94A3B8),
                    fontSize = 11.sp
                )
            }
        }
    }
}

@Composable
fun DynamicQrCodeCanvas(
    seed: Int,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        val random = Random(seed.toLong())
        val gridSize = 11
        val cellSize = size.width / gridSize

        // Draw 3 Corner Position Markers
        val cornerBoxes = listOf(
            Offset(0f, 0f),
            Offset((gridSize - 3) * cellSize, 0f),
            Offset(0f, (gridSize - 3) * cellSize)
        )

        cornerBoxes.forEach { boxOffset ->
            drawRoundRect(
                color = Color.Black,
                topLeft = boxOffset,
                size = Size(cellSize * 3, cellSize * 3),
                cornerRadius = CornerRadius(4f, 4f)
            )
            drawRoundRect(
                color = Color.White,
                topLeft = Offset(boxOffset.x + cellSize * 0.5f, boxOffset.y + cellSize * 0.5f),
                size = Size(cellSize * 2, cellSize * 2),
                cornerRadius = CornerRadius(2f, 2f)
            )
            drawRoundRect(
                color = Color.Black,
                topLeft = Offset(boxOffset.x + cellSize, boxOffset.y + cellSize),
                size = Size(cellSize, cellSize),
                cornerRadius = CornerRadius(1f, 1f)
            )
        }

        // Fill remaining pseudo data cells
        for (row in 0 until gridSize) {
            for (col in 0 until gridSize) {
                val inTopLeft = row < 3 && col < 3
                val inTopRight = row < 3 && col >= gridSize - 3
                val inBottomLeft = row >= gridSize - 3 && col < 3
                if (inTopLeft || inTopRight || inBottomLeft) continue

                if (random.nextBoolean()) {
                    drawRect(
                        color = Color.Black,
                        topLeft = Offset(col * cellSize, row * cellSize),
                        size = Size(cellSize * 0.9f, cellSize * 0.9f)
                    )
                }
            }
        }
    }
}
