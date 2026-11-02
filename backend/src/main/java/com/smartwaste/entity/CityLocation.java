package com.smartwaste.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "city_locations")
public class CityLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "location_code", nullable = false, unique = true, length = 30)
    private String locationCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "location_type", nullable = false, length = 30)
    private LocationType locationType = LocationType.DUSTBIN_POINT;

    @Column(length = 255)
    private String description;

    public enum LocationType {
        DEPOT, INTERSECTION, DUSTBIN_POINT, LANDFILL
    }

    public CityLocation() {}

    public CityLocation(String locationCode, String name, Double latitude, Double longitude, LocationType locationType, String description) {
        this.locationCode = locationCode;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.locationType = locationType;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getLocationCode() { return locationCode; }
    public void setLocationCode(String locationCode) { this.locationCode = locationCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public LocationType getLocationType() { return locationType; }
    public void setLocationType(LocationType locationType) { this.locationType = locationType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
