package com.smartwaste.dto;

import com.smartwaste.entity.Complaint;

public class ComplaintCreateDTO {
    private String userName;
    private String contactDetails;
    private Complaint.Category category;
    private String location;
    private Double latitude;
    private Double longitude;
    private String description;
    private String photographUrl;

    public ComplaintCreateDTO() {}

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getContactDetails() { return contactDetails; }
    public void setContactDetails(String contactDetails) { this.contactDetails = contactDetails; }
    public Complaint.Category getCategory() { return category; }
    public void setCategory(Complaint.Category category) { this.category = category; }
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
}
