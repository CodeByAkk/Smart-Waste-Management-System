package com.smartwaste.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "road_connections")
public class RoadConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_location_code", nullable = false, length = 30)
    private String sourceLocationCode;

    @Column(name = "target_location_code", nullable = false, length = 30)
    private String targetLocationCode;

    @Column(name = "distance_km", nullable = false)
    private Double distanceKm;

    @Column(name = "road_name", nullable = false, length = 100)
    private String roadName;

    @Column(name = "is_two_way")
    private Boolean isTwoWay = true;

    public RoadConnection() {}

    public RoadConnection(String sourceLocationCode, String targetLocationCode, Double distanceKm, String roadName, Boolean isTwoWay) {
        this.sourceLocationCode = sourceLocationCode;
        this.targetLocationCode = targetLocationCode;
        this.distanceKm = distanceKm;
        this.roadName = roadName;
        this.isTwoWay = isTwoWay;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSourceLocationCode() { return sourceLocationCode; }
    public void setSourceLocationCode(String sourceLocationCode) { this.sourceLocationCode = sourceLocationCode; }
    public String getTargetLocationCode() { return targetLocationCode; }
    public void setTargetLocationCode(String targetLocationCode) { this.targetLocationCode = targetLocationCode; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public String getRoadName() { return roadName; }
    public void setRoadName(String roadName) { this.roadName = roadName; }
    public Boolean getIsTwoWay() { return isTwoWay; }
    public void setIsTwoWay(Boolean isTwoWay) { this.isTwoWay = isTwoWay; }
}

