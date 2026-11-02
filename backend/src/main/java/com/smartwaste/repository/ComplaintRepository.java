package com.smartwaste.repository;

import com.smartwaste.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Optional<Complaint> findByComplaintCode(String complaintCode);
    List<Complaint> findByStatus(Complaint.Status status);
    List<Complaint> findByOrderByCreatedAtDesc();
    long countByStatus(Complaint.Status status);
}

