package com.smartwaste.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_number", nullable = false, unique = true, length = 30)
    private String vehicleNumber; // e.g., "MH-12-GW-9001"

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType = "Compactor Truck";

    @Column(name = "capacity_kg", nullable = false)
    private Double capacityKg = 3500.0;

    @Column(name = "current_location", nullable = false, length = 100)
    private String currentLocation = "Central Depot";

    private Double latitude = 18.5204;
    private Double longitude = 73.8567;

    @Column(name = "driver_name", length = 100)
    private String driverName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.AVAILABLE;

    @Column(name = "current_assigned_route", length = 255)
    private String currentAssignedRoute;

    @Column(name = "collected_waste_capacity", nullable = false)
    private Double collectedWasteCapacity = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status {
        AVAILABLE, ON_DUTY, BUSY, MAINTENANCE
    }

    public Vehicle() {}

    public Vehicle(String vehicleNumber, String vehicleType, Double capacityKg, String currentLocation,
                   Double latitude, Double longitude, String driverName, Status status) {
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
        this.capacityKg = capacityKg;
        this.currentLocation = currentLocation;
        this.latitude = latitude;
        this.longitude = longitude;
        this.driverName = driverName;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public Double getCapacityKg() { return capacityKg; }
    public void setCapacityKg(Double capacityKg) { this.capacityKg = capacityKg; }
    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getCurrentAssignedRoute() { return currentAssignedRoute; }
    public void setCurrentAssignedRoute(String currentAssignedRoute) { this.currentAssignedRoute = currentAssignedRoute; }
    public Double getCollectedWasteCapacity() { return collectedWasteCapacity; }
    public void setCollectedWasteCapacity(Double collectedWasteCapacity) { this.collectedWasteCapacity = collectedWasteCapacity; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

