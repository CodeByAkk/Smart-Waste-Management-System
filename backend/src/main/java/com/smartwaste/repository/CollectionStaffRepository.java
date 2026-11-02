package com.smartwaste.repository;

import com.smartwaste.entity.CollectionStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionStaffRepository extends JpaRepository<CollectionStaff, Long> {
    Optional<CollectionStaff> findByEmployeeId(String employeeId);
    List<CollectionStaff> findByWorkingStatus(CollectionStaff.WorkingStatus status);
}

