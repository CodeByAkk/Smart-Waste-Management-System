package com.smartwaste.controller;

import com.smartwaste.dto.ComplaintCreateDTO;
import com.smartwaste.dto.ComplaintStatusUpdateDTO;
import com.smartwaste.entity.Complaint;
import com.smartwaste.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable Long id) {
        return complaintService.getComplaintById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/track/{code}")
    public ResponseEntity<Complaint> trackComplaint(@PathVariable String code) {
        return complaintService.getComplaintByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Complaint> submitComplaint(@RequestBody ComplaintCreateDTO dto) {
        return ResponseEntity.ok(complaintService.submitComplaint(dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(@PathVariable Long id, @RequestBody ComplaintStatusUpdateDTO dto) {
        return ResponseEntity.ok(complaintService.updateComplaintStatus(id, dto));
    }
}
