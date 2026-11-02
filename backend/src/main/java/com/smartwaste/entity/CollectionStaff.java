package com.smartwaste.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "collection_staff")
public class CollectionStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false, unique = true, length = 30)
    private String employeeId; // e.g., "STF-101"

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "contact_number", nullable = false, length = 20)
    private String contactNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_vehicle_id")
    private Vehicle assignedVehicle;

    @Column(name = "assigned_route", length = 255)
    private String assignedRoute;

    @Enumerated(EnumType.STRING)
    @Column(name = "working_status", nullable = false, length = 30)
    private WorkingStatus workingStatus = WorkingStatus.ACTIVE;

    @Column(name = "completed_collections", nullable = false)
    private Integer completedCollections = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum WorkingStatus {
        ACTIVE, ON_LEAVE, BUSY
    }

    public CollectionStaff() {}

    public CollectionStaff(String employeeId, String name, String contactNumber, Vehicle assignedVehicle, WorkingStatus workingStatus) {
        this.employeeId = employeeId;
        this.name = name;
        this.contactNumber = contactNumber;
        this.assignedVehicle = assignedVehicle;
        this.workingStatus = workingStatus;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public Vehicle getAssignedVehicle() { return assignedVehicle; }
    public void setAssignedVehicle(Vehicle assignedVehicle) { this.assignedVehicle = assignedVehicle; }
    public String getAssignedRoute() { return assignedRoute; }
    public void setAssignedRoute(String assignedRoute) { this.assignedRoute = assignedRoute; }
    public WorkingStatus getWorkingStatus() { return workingStatus; }
    public void setWorkingStatus(WorkingStatus workingStatus) { this.workingStatus = workingStatus; }
    public Integer getCompletedCollections() { return completedCollections; }
    public void setCompletedCollections(Integer completedCollections) { this.completedCollections = completedCollections; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
