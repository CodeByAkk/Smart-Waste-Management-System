package com.smartwaste.service;

import com.smartwaste.dto.ComplaintCreateDTO;
import com.smartwaste.dto.ComplaintStatusUpdateDTO;
import com.smartwaste.entity.CollectionStaff;
import com.smartwaste.entity.Complaint;
import com.smartwaste.repository.CollectionStaffRepository;
import com.smartwaste.repository.ComplaintRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CollectionStaffRepository staffRepository;
    private final NotificationService notificationService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            CollectionStaffRepository staffRepository,
                            NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.staffRepository = staffRepository;
        this.notificationService = notificationService;
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findByOrderByCreatedAtDesc();
    }

    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    public Optional<Complaint> getComplaintByCode(String code) {
        return complaintRepository.findByComplaintCode(code);
    }

    @Transactional
    public Complaint submitComplaint(ComplaintCreateDTO dto) {
        String code = "CMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Complaint complaint = new Complaint(
                code,
                dto.getUserName(),
                dto.getContactDetails(),
                dto.getCategory(),
                dto.getLocation(),
                dto.getLatitude(),
                dto.getLongitude(),
                dto.getDescription(),
                dto.getPhotographUrl()
        );
        Complaint saved = complaintRepository.save(complaint);
        notificationService.addAlert(
                "COMPLAINT",
                "New Public Complaint Filed",
                "Citizen " + saved.getUserName() + " reported " + saved.getCategory() + " at " + saved.getLocation(),
                "warning"
        );
        return saved;
    }

    @Transactional
    public Complaint updateComplaintStatus(Long id, ComplaintStatusUpdateDTO dto) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        if (dto.getStatus() != null) {
            complaint.setStatus(dto.getStatus());
            if (dto.getStatus() == Complaint.Status.RESOLVED) {
                complaint.setResolvedAt(LocalDateTime.now());
            }
        }
        if (dto.getAssignedStaffId() != null) {
            CollectionStaff staff = staffRepository.findById(dto.getAssignedStaffId()).orElse(null);
            complaint.setAssignedStaff(staff);
            if (complaint.getStatus() == Complaint.Status.SUBMITTED || complaint.getStatus() == Complaint.Status.UNDER_REVIEW) {
                complaint.setStatus(Complaint.Status.ASSIGNED);
            }
        }
        if (dto.getAdminNotes() != null) {
            complaint.setAdminNotes(dto.getAdminNotes());
        }

        return complaintRepository.save(complaint);
    }
}

