package com.smartwaste.dto;

import java.util.List;

public class OptimizeRouteRequestDTO {
    private String vehicleId;
    private String startDepotCode = "DEPOT-01";
    private Integer minimumFillThreshold = 75; // Only bins >= 75% by default
    private List<String> specificDustbinCodes;

    public OptimizeRouteRequestDTO() {}

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }
    public String getStartDepotCode() { return startDepotCode; }
    public void setStartDepotCode(String startDepotCode) { this.startDepotCode = startDepotCode; }
    public Integer getMinimumFillThreshold() { return minimumFillThreshold; }
    public void setMinimumFillThreshold(Integer minimumFillThreshold) { this.minimumFillThreshold = minimumFillThreshold; }
    public List<String> getSpecificDustbinCodes() { return specificDustbinCodes; }
    public void setSpecificDustbinCodes(List<String> specificDustbinCodes) { this.specificDustbinCodes = specificDustbinCodes; }
}

