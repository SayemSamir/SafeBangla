package com.example

import com.example.data.model.*
import com.example.data.repository.SafeBanglaRepository
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class SafeBanglaRepositoryTest {

    private lateinit var repository: SafeBanglaRepository

    @Before
    fun setUp() {
        repository = SafeBanglaRepository()
    }

    @Test
    fun testTriggerCitizenSosCreatesAlert() {
        val initialCount = repository.sosAlerts.value.size
        val newAlert = repository.triggerCitizenSos(
            name = "Test Citizen",
            phone = "+880 1711-000111",
            latitude = 22.3569,
            longitude = 91.7832,
            locationName = "Patenga Coast",
            division = "Chattogram",
            type = DisasterType.CYCLONE,
            severity = Severity.CRITICAL,
            peopleCount = 5,
            waterLevelCm = 150,
            notes = "Family trapped by tidal storm surge",
            isSilent = false,
            isOfflineSms = false,
            isBleRelayed = false
        )

        val updatedAlerts = repository.sosAlerts.value
        assertEquals(initialCount + 1, updatedAlerts.size)
        assertEquals("Test Citizen", updatedAlerts.first().victimName)
        assertEquals(Severity.CRITICAL, updatedAlerts.first().severity)
        assertEquals(SosStatus.PENDING, updatedAlerts.first().status)
    }

    @Test
    fun testAcceptMissionLocksSosSignal() {
        val sosId = "SOS-8491"
        repository.acceptMission(sosId, "Kazi Rayhan")

        val alert = repository.sosAlerts.value.first { it.id == sosId }
        assertEquals(SosStatus.ASSIGNED, alert.status)
        assertEquals("Kazi Rayhan", alert.assignedVolunteer)
    }

    @Test
    fun testDeployRescueUnitUpdatesStatus() {
        val sosId = "SOS-8491"
        repository.deployRescueUnit(sosId, "Coast Guard Speedboat #1")

        val alert = repository.sosAlerts.value.first { it.id == sosId }
        assertEquals(SosStatus.RESCUE_DEPLOYED, alert.status)
        assertEquals("Coast Guard Speedboat #1", alert.assignedUnit)
    }

    @Test
    fun testShelterOccupancyUpdate() {
        val shelterId = "SH-01"
        val initialOccupancy = repository.shelters.value.first { it.id == shelterId }.currentOccupancy
        repository.updateShelterOccupancy(shelterId, 50)

        val updated = repository.shelters.value.first { it.id == shelterId }
        assertEquals(initialOccupancy + 50, updated.currentOccupancy)
    }

    @Test
    fun testAiCrisisChatbotGeneratesResponse() {
        val initialSize = repository.chatMessages.value.size
        repository.sendChatMessage("What should I do during a cyclone?", isBangla = false)

        val messages = repository.chatMessages.value
        assertEquals(initialSize + 2, messages.size)
        assertTrue(messages.last().textEnglish.contains("CYCLONE SAFETY GUIDE"))
    }

    @Test
    fun testDroneDispatchAndAirdrop() {
        val droneId = "DRONE-DELTA-01"
        repository.dispatchDroneToMission(droneId, "Haor Basin Sector 4")

        var drone = repository.droneFleet.value.first { it.id == droneId }
        assertEquals(DroneStatus.DELIVERING_PAYLOAD, drone.status)
        assertEquals("Haor Basin Sector 4", drone.destinationZone)

        repository.triggerAirdrop(droneId)
        drone = repository.droneFleet.value.first { it.id == droneId }
        assertEquals(DroneStatus.MISSION_ACCOMPLISHED, drone.status)
        assertEquals(0.0, drone.payloadKg, 0.001)
    }

    @Test
    fun testHazardReportingAndUpvoting() {
        val newHazard = repository.reportNewHazard(
            category = HazardCategory.FALLEN_ELECTRIC_WIRE,
            title = "Live Wire across road",
            banglaTitle = "সড়কে ছেঁড়া তার",
            locationName = "Chittagong Port Gate 2",
            latitude = 22.3100,
            longitude = 91.8000,
            urgency = Severity.CRITICAL
        )

        assertEquals("Live Wire across road", newHazard.title)
        val hazardId = newHazard.id

        repository.upvoteHazard(hazardId)
        val updated = repository.hazardReports.value.first { it.id == hazardId }
        assertEquals(2, updated.upvotes)
        assertTrue(updated.userVotedUp)
    }

    @Test
    fun testWaterSensorWebhookAlarm() {
        val sensorId = "SENSOR-BWDB-01"
        // Exceed danger level of 8.00m by setting to 9.20m
        repository.triggerSensorWebhookAlarm(sensorId, 9.20)

        val sensor = repository.waterSensors.value.first { it.id == sensorId }
        assertEquals(9.20, sensor.currentLevelMeters, 0.001)
        assertTrue(sensor.isTriggeringAlarm)
        assertEquals(WaterTrend.RISING_RAPIDLY, sensor.trend)
    }
}
