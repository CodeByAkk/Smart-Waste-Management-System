package com.smartwaste.dto;

public class SensorUpdateDTO {
    private String dustbinCode;
    private Integer fillPercentage;
    private Boolean isSimulated = true;

    public SensorUpdateDTO() {}

    public SensorUpdateDTO(String dustbinCode, Integer fillPercentage, Boolean isSimulated) {
        this.dustbinCode = dustbinCode;
        this.fillPercentage = fillPercentage;
        this.isSimulated = isSimulated;
    }

    public String getDustbinCode() { return dustbinCode; }
    public void setDustbinCode(String dustbinCode) { this.dustbinCode = dustbinCode; }
    public Integer getFillPercentage() { return fillPercentage; }
    public void setFillPercentage(Integer fillPercentage) { this.fillPercentage = fillPercentage; }
    public Boolean getIsSimulated() { return isSimulated; }
    public void setIsSimulated(Boolean isSimulated) { this.isSimulated = isSimulated; }
}

