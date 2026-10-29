package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.window.Dialog
import com.example.data.model.Hospital
import com.example.data.model.Language
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel

@Composable
fun HospitalsScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val hospitals by viewModel.hospitals.collectAsState()
    val ambulanceModalHospital by viewModel.ambulanceDispatchModal.collectAsState()
    val ambulanceSuccessStatus by viewModel.ambulanceSuccessStatus.collectAsState()

    var patientName by remember { mutableStateOf("") }
    var patientCondition by remember { mutableStateOf("Trauma / Drowning / Snakebite") }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(SlateDark)
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = if (language == Language.BANGLA) "জরুরি হাসপাতাল ও অ্যাম্বুলেন্স" else "Emergency Hospitals & Ambulance",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = if (language == Language.BANGLA) "আইসিইউ ও ইমার্জেন্সি বেড লাইভ ট্র্যাকার" else "Live ICU/ER Beds & Immediate Transport",
                    fontSize = 12.sp,
                    color = SlateMuted
                )
            }

            Surface(
                color = EmergencyRed.copy(alpha = 0.2f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "RAPID DISPATCH",
                    color = EmergencyRedGlow,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(bottom = 20.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(hospitals, key = { it.id }) { hospital ->
                HospitalCard(
                    hospital = hospital,
                    language = language,
                    onRequestAmbulance = { viewModel.openAmbulanceModal(hospital) },
                    onCallHospital = { viewModel.openDialer(hospital.contactPhone) },
                    onNavigate = {
                        viewModel.openNavigationMap(hospital.latitude, hospital.longitude, hospital.name)
                    }
                )
            }
        }
    }

    // Ambulance Dispatch Request Modal
    ambulanceModalHospital?.let { hospital ->
        Dialog(onDismissRequest = { viewModel.closeAmbulanceModal() }) {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, EmergencyRed),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.MedicalServices, contentDescription = null, tint = EmergencyRedGlow)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (language == Language.BANGLA) "জরুরি অ্যাম্বুলেন্স রিকুয়েস্ট" else "Request Emergency Ambulance",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Origin: ${hospital.name} (${hospital.district})",
                        color = SafetyCyan,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    if (ambulanceSuccessStatus != null) {
                        Surface(
                            color = BengalGreenDark.copy(alpha = 0.4f),
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BengalGreen),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = BengalGreen)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("DISPATCH ACTIVE", color = BengalGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = ambulanceSuccessStatus!!,
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    lineHeight = 16.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))
                        Button(
                            onClick = { viewModel.closeAmbulanceModal() },
                            colors = ButtonDefaults.buttonColors(containerColor = SlateCardElevated),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Done", color = Color.White)
                        }
                    } else {
                        OutlinedTextField(
                            value = patientName,
                            onValueChange = { patientName = it },
                            label = { Text("Patient Name") },
                            placeholder = { Text("e.g. Karim Ullah") },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = patientCondition,
                            onValueChange = { patientCondition = it },
                            label = { Text("Medical Condition / Injury") },
                            placeholder = { Text("e.g. Flash flood hypothermia / Snakebite") },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        Button(
                            onClick = { viewModel.confirmAmbulanceDispatch(patientName, patientCondition) },
                            colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("confirm_ambulance_dispatch_button")
                        ) {
                            Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("CONFIRM EMERGENCY DISPATCH", color = Color.White, fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        TextButton(
                            onClick = { viewModel.closeAmbulanceModal() },
                            modifier = Modifier.align(Alignment.CenterHorizontally)
                        ) {
                            Text("Cancel", color = SlateMuted)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun HospitalCard(
    hospital: Hospital,
    language: Language,
    onRequestAmbulance: () -> Unit,
    onCallHospital: () -> Unit,
    onNavigate: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("hospital_card_${hospital.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = if (language == Language.BANGLA) hospital.banglaName else hospital.name,
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${hospital.district} • ${hospital.distanceKm} km away",
                        color = SlateMuted,
                        fontSize = 11.sp
                    )
                }

                Surface(
                    color = SafetyCyan.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "${hospital.ambulanceFleetCount} AMBULANCES",
                        color = SafetyCyan,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // ICU and ER Bed Counters
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                BedCounterBox(
                    label = "ICU Beds Free",
                    count = hospital.availableIcuBeds,
                    color = if (hospital.availableIcuBeds > 5) BengalGreen else WarningYellow,
                    modifier = Modifier.weight(1f)
                )
                BedCounterBox(
                    label = "Emergency/ER Beds",
                    count = hospital.availableErBeds,
                    color = BengalGreen,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Blood Bank stock row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Blood Bank (Bags):",
                    color = SlateLight,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.width(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    hospital.bloodBankUnits.forEach { (type, count) ->
                        Surface(
                            color = EmergencyRedDark.copy(alpha = 0.3f),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = "$type: $count",
                                color = Color.White,
                                fontSize = 9.sp,
                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onRequestAmbulance,
                    colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1.2f)
                ) {
                    Icon(Icons.Default.LocalHospital, contentDescription = null, modifier = Modifier.size(15.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (language == Language.BANGLA) "অ্যাম্বুলেন্স ডাকুন" else "Dispatch Ambulance",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                FilledTonalButton(
                    onClick = onCallHospital,
                    colors = ButtonDefaults.filledTonalButtonColors(containerColor = SlateCardElevated),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(0.9f)
                ) {
                    Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(15.dp), tint = SafetyCyan)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Call ER", fontSize = 11.sp, color = Color.White)
                }

                IconButton(
                    onClick = onNavigate,
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(SlateCardElevated)
                ) {
                    Icon(Icons.Default.Navigation, contentDescription = "Navigate", tint = SafetyCyan, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

@Composable
private fun BedCounterBox(
    label: String,
    count: Int,
    color: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        color = SlateCardElevated,
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = count.toString(), color = color, fontSize = 20.sp, fontWeight = FontWeight.Black)
            Text(text = label, color = SlateMuted, fontSize = 10.sp)
        }
    }
}
