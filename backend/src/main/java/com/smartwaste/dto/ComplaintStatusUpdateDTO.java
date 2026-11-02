package com.smartwaste.dto;

import com.smartwaste.entity.Complaint;

public class ComplaintStatusUpdateDTO {
    private Complaint.Status status;
    private Long assignedStaffId;
    private String adminNotes;

    public ComplaintStatusUpdateDTO() {}

    public Complaint.Status getStatus() { return status; }
    public void setStatus(Complaint.Status status) { this.status = status; }
    public Long getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(Long assignedStaffId) { this.assignedStaffId = assignedStaffId; }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
}

