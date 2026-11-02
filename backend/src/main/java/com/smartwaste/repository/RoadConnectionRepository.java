package com.smartwaste.repository;

import com.smartwaste.entity.RoadConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadConnectionRepository extends JpaRepository<RoadConnection, Long> {
    List<RoadConnection> findBySourceLocationCode(String sourceLocationCode);
    List<RoadConnection> findByTargetLocationCode(String targetLocationCode);
}

