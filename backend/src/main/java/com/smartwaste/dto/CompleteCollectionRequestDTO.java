package com.smartwaste.dto;

public class CompleteCollectionRequestDTO {
    private String dustbinCode;
    private Long staffId;
    private Long vehicleId;
    private Double collectedWasteQuantity;

    public CompleteCollectionRequestDTO() {}

    public String getDustbinCode() { return dustbinCode; }
    public void setDustbinCode(String dustbinCode) { this.dustbinCode = dustbinCode; }
    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public Double getCollectedWasteQuantity() { return collectedWasteQuantity; }
    public void setCollectedWasteQuantity(Double collectedWasteQuantity) { this.collectedWasteQuantity = collectedWasteQuantity; }
}
