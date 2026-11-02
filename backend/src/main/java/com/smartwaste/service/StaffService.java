package com.smartwaste.service;

import com.smartwaste.entity.CollectionStaff;
import com.smartwaste.repository.CollectionStaffRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    private final CollectionStaffRepository staffRepository;

    public StaffService(CollectionStaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    public List<CollectionStaff> getAllStaff() {
        return staffRepository.findAll();
    }

    public Optional<CollectionStaff> getStaffById(Long id) {
        return staffRepository.findById(id);
    }

    @Transactional
    public CollectionStaff createStaff(CollectionStaff staff) {
        if (staffRepository.findByEmployeeId(staff.getEmployeeId()).isPresent()) {
            throw new IllegalArgumentException("Employee ID " + staff.getEmployeeId() + " already exists.");
        }
        return staffRepository.save(staff);
    }

    @Transactional
    public CollectionStaff updateStaff(Long id, CollectionStaff updated) {
        CollectionStaff existing = staffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found with id: " + id));

        existing.setName(updated.getName());
        existing.setContactNumber(updated.getContactNumber());
        existing.setAssignedVehicle(updated.getAssignedVehicle());
        existing.setAssignedRoute(updated.getAssignedRoute());
        existing.setWorkingStatus(updated.getWorkingStatus());

        return staffRepository.save(existing);
    }

    @Transactional
    public void deleteStaff(Long id) {
        staffRepository.deleteById(id);
    }
}
