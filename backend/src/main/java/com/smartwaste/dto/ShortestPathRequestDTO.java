package com.smartwaste.dto;

public class ShortestPathRequestDTO {
    private String startLocationCode;
    private String endLocationCode;

    public ShortestPathRequestDTO() {}

    public ShortestPathRequestDTO(String startLocationCode, String endLocationCode) {
        this.startLocationCode = startLocationCode;
        this.endLocationCode = endLocationCode;
    }

    public String getStartLocationCode() { return startLocationCode; }
    public void setStartLocationCode(String startLocationCode) { this.startLocationCode = startLocationCode; }
    public String getEndLocationCode() { return endLocationCode; }
    public void setEndLocationCode(String endLocationCode) { this.endLocationCode = endLocationCode; }
}

