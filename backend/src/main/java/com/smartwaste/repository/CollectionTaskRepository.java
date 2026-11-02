package com.smartwaste.repository;

import com.smartwaste.entity.CollectionTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionTaskRepository extends JpaRepository<CollectionTask, Long> {
    Optional<CollectionTask> findByTaskCode(String taskCode);
    List<CollectionTask> findByStatus(CollectionTask.TaskStatus status);
    List<CollectionTask> findByStaffId(Long staffId);
    List<CollectionTask> findByVehicleId(Long vehicleId);
}

