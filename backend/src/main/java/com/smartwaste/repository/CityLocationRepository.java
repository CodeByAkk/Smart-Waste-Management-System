package com.smartwaste.repository;

import com.smartwaste.entity.CityLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CityLocationRepository extends JpaRepository<CityLocation, Long> {
    Optional<CityLocation> findByLocationCode(String locationCode);
    boolean existsByLocationCode(String locationCode);
}
