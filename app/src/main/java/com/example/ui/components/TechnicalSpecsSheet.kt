package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Storage
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
import com.example.ui.theme.*

@Composable
fun TechnicalSpecsSheet(
    isOpen: Boolean,
    onDismiss: () -> Unit
) {
    if (!isOpen) return

    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("PostgreSQL Models", "Django Endpoints", "Offline SQLite Schema", "FCM & Security Architecture")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            colors = CardDefaults.cardColors(containerColor = SlateDark),
            shape = RoundedCornerShape(20.dp),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, SafetyTeal),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.88f)
                .padding(8.dp)
                .testTag("tech_specs_modal")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Storage, contentDescription = null, tint = SafetyCyan)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "SafeBangla Full-Stack Architecture",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = SlateMuted)
                    }
                }

                ScrollableTabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = SlateSurface,
                    contentColor = SafetyCyan,
                    edgePadding = 0.dp,
                    modifier = Modifier.padding(vertical = 8.dp)
                ) {
                    tabs.forEachIndexed { i, title ->
                        Tab(
                            selected = selectedTab == i,
                            onClick = { selectedTab = i },
                            text = { Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                        )
                    }
                }

                val scrollState = rememberScrollState()
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .background(Color(0xFF070B14), RoundedCornerShape(10.dp))
                        .border(1.dp, SlateBorder, RoundedCornerShape(10.dp))
                        .padding(12.dp)
                        .verticalScroll(scrollState)
                ) {
                    val codeContent = when (selectedTab) {
                        0 -> postgresqlSchemaContent
                        1 -> djangoApiContent
                        2 -> offlineSqliteSchemaContent
                        else -> fcmAndSecurityContent
                    }
                    Text(
                        text = codeContent,
                        color = Color(0xFFE2E8F0),
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Button(
                    onClick = onDismiss,
                    colors = ButtonDefaults.buttonColors(containerColor = SlateCardElevated),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Close Architecture Inspector", color = Color.White, fontSize = 12.sp)
                }
            }
        }
    }
}

private const val postgresqlSchemaContent = """-- ========================================================
-- SafeBangla PostgreSQL Database Schema (Advanced Ops)
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Users Table (RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CITIZEN', 'VOLUNTEER', 'RESCUE_TEAM', 'ADMIN')),
    blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    emergency_contact_phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    fcm_device_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SOS Alerts
CREATE TABLE sos_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    location_name VARCHAR(255),
    division VARCHAR(50) NOT NULL,
    disaster_type VARCHAR(30) NOT NULL,
    severity_level VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    people_count INT DEFAULT 1,
    water_level_cm INT DEFAULT 0,
    audio_s3_url TEXT,
    is_offline_sms BOOLEAN DEFAULT FALSE,
    is_mesh_relayed BOOLEAN DEFAULT FALSE,
    mesh_hop_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Autonomous Drone & Robot Fleet
CREATE TABLE drone_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    callsign VARCHAR(100) NOT NULL,
    drone_type VARCHAR(50) NOT NULL CHECK (drone_type IN ('AERIAL_SUPPLY_HEXACOPTER', 'AMPHIBIOUS_RESCUE_ROBOT', 'MEDICAL_AIRDROP_UAV')),
    battery_percentage INT NOT NULL CHECK (battery_percentage BETWEEN 0 AND 100),
    altitude_meters INT DEFAULT 0,
    speed_kmh INT DEFAULT 0,
    payload_description VARCHAR(255),
    payload_weight_kg NUMERIC(5, 2) DEFAULT 0.0,
    current_location GEOMETRY(Point, 4326),
    status VARCHAR(50) DEFAULT 'STANDBY' CHECK (status IN ('PATROLLING', 'DELIVERING_PAYLOAD', 'MISSION_ACCOMPLISHED', 'RETURNING_TO_BASE', 'STANDBY')),
    destination_zone VARCHAR(150),
    live_stream_rtsp_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crowdsourced Hazard Reports
CREATE TABLE hazard_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id),
    category VARCHAR(50) NOT NULL CHECK (category IN ('ROAD_BLOCKAGE', 'FALLEN_ELECTRIC_WIRE', 'EMBANKMENT_BREACH', 'SEVERE_WATERLOGGING', 'BRIDGE_COLLAPSED')),
    title VARCHAR(255) NOT NULL,
    bangla_title VARCHAR(255),
    location_name VARCHAR(200),
    geom GEOMETRY(Point, 4326),
    upvotes INT DEFAULT 1,
    downvotes INT DEFAULT 0,
    is_verified_by_authority BOOLEAN DEFAULT FALSE,
    urgency_level VARCHAR(20) DEFAULT 'HIGH',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. IoT Water-Level Flood Gauges
CREATE TABLE water_level_sensors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_name VARCHAR(150) NOT NULL,
    river_name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    current_level_meters NUMERIC(6, 2) NOT NULL,
    danger_level_meters NUMERIC(6, 2) NOT NULL,
    rate_of_rise_cm_hr NUMERIC(5, 2) DEFAULT 0.0,
    is_alarm_triggered BOOLEAN DEFAULT FALSE,
    geom GEOMETRY(Point, 4326),
    last_telemetry_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);"""

private const val djangoApiContent = """# ========================================================
# SafeBangla Django REST Framework Views & Webhooks
# ========================================================

# apps/fleet/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DroneUnit, HazardReport, WaterLevelSensor
from .serializers import DroneUnitSerializer, HazardReportSerializer
from ..sos.services.fcm import send_fcm_disaster_broadcast

class DroneFleetViewSet(viewsets.ModelViewSet):
    queryset = DroneUnit.objects.all()
    serializer_class = DroneUnitSerializer

    @action(detail=True, methods=['post'])
    def trigger_airdrop(self, request, pk=None):
        drone = self.get_object()
        drone.status = 'MISSION_ACCOMPLISHED'
        drone.payload_weight_kg = 0.0
        drone.save()
        return Response({'status': 'Parachute payload deployed', 'drone': drone.callsign})

class HazardReportViewSet(viewsets.ModelViewSet):
    queryset = HazardReport.objects.all().order_by('-created_at')
    serializer_class = HazardReportSerializer

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        report = self.get_object()
        report.upvotes += 1
        if report.upvotes >= 10:
            report.is_verified_by_authority = True
        report.save()
        return Response({'upvotes': report.upvotes, 'verified': report.is_verified_by_authority})

# apps/iot/views.py (Webhook Trigger)
from rest_framework.views import APIView

class IoTRiverGaugeWebhookView(APIView):
    def post(self, request):
        station_id = request.data.get('station_id')
        current_level = float(request.data.get('water_level_meters', 0))
        sensor = WaterLevelSensor.objects.get(id=station_id)
        sensor.current_level_meters = current_level
        sensor.save()

        # Trigger Immediate Broadcast if Above Danger Level
        if current_level >= sensor.danger_level_meters:
            send_fcm_disaster_broadcast(
                title=f"FLOOD ALARM: {sensor.river_name} Exceeded Danger Mark!",
                body=f"Current: {current_level}M at {sensor.station_name}. Seek high ground immediately.",
                data={'station_id': str(sensor.id), 'severity': 'CRITICAL'}
            )
        return Response({'status': 'Telemetry ingested', 'alarm': current_level >= sensor.danger_level_meters})"""

private const val offlineSqliteSchemaContent = """-- ========================================================
-- SafeBangla Zero-Network Pre-Cached SQLite / Room Schema
-- ========================================================

-- 1. Cached Cyclone & Flood Shelters (For 100% Offline Map & Compass)
CREATE TABLE IF NOT EXISTS cached_shelters (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    bangla_name TEXT NOT NULL,
    district TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    total_capacity INTEGER NOT NULL,
    last_known_occupancy INTEGER NOT NULL,
    has_water INTEGER NOT NULL DEFAULT 1,
    has_food INTEGER NOT NULL DEFAULT 1,
    has_generator INTEGER NOT NULL DEFAULT 1,
    contact_phone TEXT NOT NULL
);

-- 2. Cached Emergency Hospitals & Blood Banks
CREATE TABLE IF NOT EXISTS cached_hospitals (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    available_icu_beds INTEGER NOT NULL,
    available_er_beds INTEGER NOT NULL,
    ambulance_phone TEXT NOT NULL
);

-- 3. Offline Outbox Queue (Holds SOS packets until BLE Mesh or SMS transmits)
CREATE TABLE IF NOT EXISTS offline_sos_outbox (
    outbox_id TEXT PRIMARY KEY NOT NULL,
    payload_string TEXT NOT NULL,
    created_timestamp INTEGER NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    is_dispatched INTEGER NOT NULL DEFAULT 0
);"""

private const val fcmAndSecurityContent = """// ========================================================
// SafeBangla FCM Notification & Multi-Hop Relay Security
// ========================================================

// 1. Firebase Cloud Messaging Payload (IoT Flood Alert Trigger)
{
  "to": "/topics/flood_warnings_surma_basin",
  "priority": "high",
  "notification": {
    "title": "বন্যা সতর্কবার্তা: সুরমা নদী বিপৎসীমা অতিক্রম করেছে!",
    "body": "সুনামগঞ্জ পয়েন্টে পানি বিপৎসীমার ৬৫ সেমি ওপর দিয়ে প্রবাহিত হচ্ছে। উঁচু স্থানে আশ্রয় নিন।",
    "sound": "emergency_siren.wav",
    "android_channel_id": "safebangla_flood_channel"
  },
  "data": {
    "station_id": "SENSOR-BWDB-01",
    "elevation_m": "8.65",
    "danger_mark_m": "8.00",
    "action": "OPEN_OFFLINE_COMPASS"
  }
}

// 2. BLE Mesh Cryptographic Protocol:
// • Payload MTU: 244-byte compact CBOR packet.
// • Packet Authentication: HMAC-SHA256 signature using sector pre-shared relief keys.
// • Replay Protection: Monotonic sequence number + 32-bit timestamp epoch window.
// • Zero-Network Fallback: Hop-by-hop forwarding across verified volunteer mobile nodes."""
