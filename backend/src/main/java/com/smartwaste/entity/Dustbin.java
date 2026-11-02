package com.smartwaste.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dustbins")
public class Dustbin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dustbin_code", nullable = false, unique = true, length = 30)
    private String dustbinCode; // e.g., "B101"

    @Column(name = "location_name", nullable = false, length = 100)
    private String locationName;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "capacity_liters", nullable = false)
    private Double capacityLiters = 500.0;

    @Column(name = "current_waste_liters", nullable = false)
    private Double currentWasteLiters = 0.0;

    @Column(name = "fill_percentage", nullable = false)
    private Integer fillPercentage = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Category category = Category.GENERAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.EMPTY;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority_level", nullable = false, length = 30)
    private PriorityLevel priorityLevel = PriorityLevel.LOW;

    @Column(name = "installation_date")
    private LocalDate installationDate = LocalDate.now();

    @Column(name = "last_collection_date")
    private LocalDateTime lastCollectionDate;

    @Column(name = "assigned_staff_name", length = 100)
    private String assignedStaffName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "city_location_id")
    private CityLocation cityLocation;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Category {
        GENERAL, ORGANIC, RECYCLABLE, HAZARDOUS, ELECTRONIC
    }

    public enum Status {
        EMPTY, MODERATE, ALMOST_FULL, CRITICAL, COLLECTED
    }

    public enum PriorityLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public Dustbin() {}

    public Dustbin(String dustbinCode, String locationName, Double latitude, Double longitude,
                   Double capacityLiters, Integer fillPercentage, Category category) {
        this.dustbinCode = dustbinCode;
        this.locationName = locationName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.capacityLiters = capacityLiters;
        this.category = category;
        updateFillPercentage(fillPercentage);
    }

    public void updateFillPercentage(int fill) {
        this.fillPercentage = Math.max(0, Math.min(100, fill));
        this.currentWasteLiters = (this.capacityLiters * this.fillPercentage) / 100.0;

        if (this.fillPercentage >= 90) {
            this.status = Status.CRITICAL;
            this.priorityLevel = PriorityLevel.CRITICAL;
        } else if (this.fillPercentage >= 75) {
            this.status = Status.ALMOST_FULL;
            this.priorityLevel = PriorityLevel.HIGH;
        } else if (this.fillPercentage >= 50) {
            this.status = Status.MODERATE;
            this.priorityLevel = PriorityLevel.MEDIUM;
        } else if (this.fillPercentage > 0) {
            this.status = Status.EMPTY;
            this.priorityLevel = PriorityLevel.LOW;
        } else {
            this.status = Status.EMPTY;
            this.priorityLevel = PriorityLevel.LOW;
        }
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDustbinCode() { return dustbinCode; }
    public void setDustbinCode(String dustbinCode) { this.dustbinCode = dustbinCode; }
    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getCapacityLiters() { return capacityLiters; }
    public void setCapacityLiters(Double capacityLiters) { this.capacityLiters = capacityLiters; }
    public Double getCurrentWasteLiters() { return currentWasteLiters; }
    public void setCurrentWasteLiters(Double currentWasteLiters) { this.currentWasteLiters = currentWasteLiters; }
    public Integer getFillPercentage() { return fillPercentage; }
    public void setFillPercentage(Integer fillPercentage) { updateFillPercentage(fillPercentage); }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public PriorityLevel getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(PriorityLevel priorityLevel) { this.priorityLevel = priorityLevel; }
    public LocalDate getInstallationDate() { return installationDate; }
    public void setInstallationDate(LocalDate installationDate) { this.installationDate = installationDate; }
    public LocalDateTime getLastCollectionDate() { return lastCollectionDate; }
    public void setLastCollectionDate(LocalDateTime lastCollectionDate) { this.lastCollectionDate = lastCollectionDate; }
    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }
    public CityLocation getCityLocation() { return cityLocation; }
    public void setCityLocation(CityLocation cityLocation) { this.cityLocation = cityLocation; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

