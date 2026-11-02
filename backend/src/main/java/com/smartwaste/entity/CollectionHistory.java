package com.smartwaste.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "collection_history")
public class CollectionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "collection_code", nullable = false, unique = true, length = 30)
    private String collectionCode;

    @Column(name = "dustbin_id", nullable = false)
    private Long dustbinId;

    @Column(name = "dustbin_code", nullable = false, length = 30)
    private String dustbinCode;

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "staff_name", length = 100)
    private String staffName;

    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(name = "vehicle_number", length = 30)
    private String vehicleNumber;

    @Column(name = "collection_date", nullable = false)
    private LocalDateTime collectionDate = LocalDateTime.now();

    @Column(name = "previous_fill_percentage", nullable = false)
    private Integer previousFillPercentage;

    @Column(name = "collected_waste_quantity", nullable = false)
    private Double collectedWasteQuantity; // in Liters or Kg

    @Column(name = "collection_status", length = 50)
    private String collectionStatus = "COMPLETED";

    public CollectionHistory() {}

    public CollectionHistory(String collectionCode, Long dustbinId, String dustbinCode,
                             Long staffId, String staffName, Long vehicleId, String vehicleNumber,
                             Integer previousFillPercentage, Double collectedWasteQuantity) {
        this.collectionCode = collectionCode;
        this.dustbinId = dustbinId;
        this.dustbinCode = dustbinCode;
        this.staffId = staffId;
        this.staffName = staffName;
        this.vehicleId = vehicleId;
        this.vehicleNumber = vehicleNumber;
        this.previousFillPercentage = previousFillPercentage;
        this.collectedWasteQuantity = collectedWasteQuantity;
        this.collectionDate = LocalDateTime.now();
        this.collectionStatus = "COMPLETED";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCollectionCode() { return collectionCode; }
    public void setCollectionCode(String collectionCode) { this.collectionCode = collectionCode; }
    public Long getDustbinId() { return dustbinId; }
    public void setDustbinId(Long dustbinId) { this.dustbinId = dustbinId; }
    public String getDustbinCode() { return dustbinCode; }
    public void setDustbinCode(String dustbinCode) { this.dustbinCode = dustbinCode; }
    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }
    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public LocalDateTime getCollectionDate() { return collectionDate; }
    public void setCollectionDate(LocalDateTime collectionDate) { this.collectionDate = collectionDate; }
    public Integer getPreviousFillPercentage() { return previousFillPercentage; }
    public void setPreviousFillPercentage(Integer previousFillPercentage) { this.previousFillPercentage = previousFillPercentage; }
    public Double getCollectedWasteQuantity() { return collectedWasteQuantity; }
    public void setCollectedWasteQuantity(Double collectedWasteQuantity) { this.collectedWasteQuantity = collectedWasteQuantity; }
    public String getCollectionStatus() { return collectionStatus; }
    public void setCollectionStatus(String collectionStatus) { this.collectionStatus = collectionStatus; }
}
