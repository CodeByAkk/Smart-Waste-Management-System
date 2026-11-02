package com.smartwaste.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_code", nullable = false, unique = true, length = 30)
    private String complaintCode; // e.g., "CMP-2026-001"

    @Column(name = "user_name", nullable = false, length = 100)
    private String userName;

    @Column(name = "contact_details", nullable = false, length = 50)
    private String contactDetails;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Category category;

    @Column(nullable = false, length = 150)
    private String location;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "photograph_url", length = 500)
    private String photographUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.SUBMITTED;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_staff_id")
    private CollectionStaff assignedStaff;

    @Column(name = "admin_notes", length = 255)
    private String adminNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    public enum Category {
        OVERFLOWING, GARBAGE_NOT_COLLECTED, DAMAGED_DUSTBIN, ILLEGAL_DUMPING, UNCLEAN_PUBLIC_AREA
    }

    public enum Status {
        SUBMITTED, UNDER_REVIEW, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED
    }

    public Complaint() {}

    public Complaint(String complaintCode, String userName, String contactDetails, Category category,
                     String location, Double latitude, Double longitude, String description, String photographUrl) {
        this.complaintCode = complaintCode;
        this.userName = userName;
        this.contactDetails = contactDetails;
        this.category = category;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;
        this.photographUrl = photographUrl;
        this.status = Status.SUBMITTED;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getComplaintCode() { return complaintCode; }
    public void setComplaintCode(String complaintCode) { this.complaintCode = complaintCode; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getContactDetails() { return contactDetails; }
    public void setContactDetails(String contactDetails) { this.contactDetails = contactDetails; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPhotographUrl() { return photographUrl; }
    public void setPhotographUrl(String photographUrl) { this.photographUrl = photographUrl; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public CollectionStaff getAssignedStaff() { return assignedStaff; }
    public void setAssignedStaff(CollectionStaff assignedStaff) { this.assignedStaff = assignedStaff; }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
