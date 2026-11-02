package com.smartwaste.service;

import com.smartwaste.entity.Dustbin;
import com.smartwaste.repository.DustbinRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class DustbinService {

    private final DustbinRepository dustbinRepository;
    private final PriorityService priorityService;
    private final NotificationService notificationService;
    private final Random random = new Random();

    public DustbinService(DustbinRepository dustbinRepository,
                          PriorityService priorityService,
                          NotificationService notificationService) {
        this.dustbinRepository = dustbinRepository;
        this.priorityService = priorityService;
        this.notificationService = notificationService;
    }

    public List<Dustbin> getAllDustbins() {
        return dustbinRepository.findAll();
    }

    public Optional<Dustbin> getDustbinById(Long id) {
        return dustbinRepository.findById(id);
    }

    public Optional<Dustbin> getDustbinByCode(String code) {
        return dustbinRepository.findByDustbinCode(code);
    }

    @Transactional
    public Dustbin createDustbin(Dustbin dustbin) {
        if (dustbin.getDustbinCode() == null || dustbin.getDustbinCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Dustbin code is required.");
        }
        if (dustbinRepository.existsByDustbinCode(dustbin.getDustbinCode())) {
            throw new IllegalArgumentException("Dustbin code " + dustbin.getDustbinCode() + " already exists.");
        }
        dustbin.updateFillPercentage(dustbin.getFillPercentage() != null ? dustbin.getFillPercentage() : 0);
        Dustbin saved = dustbinRepository.save(dustbin);
        priorityService.updatePriority(saved);
        notificationService.addAlert("INFO", "New Dustbin Added",
                "Dustbin " + saved.getDustbinCode() + " installed at " + saved.getLocationName(), "info");
        return saved;
    }

    @Transactional
    public Dustbin updateDustbin(Long id, Dustbin updated) {
        Dustbin existing = dustbinRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dustbin not found with id: " + id));

        existing.setLocationName(updated.getLocationName());
        existing.setLatitude(updated.getLatitude());
        existing.setLongitude(updated.getLongitude());
        existing.setCapacityLiters(updated.getCapacityLiters());
        existing.setCategory(updated.getCategory());
        existing.setAssignedStaffName(updated.getAssignedStaffName());
        if (updated.getFillPercentage() != null) {
            existing.updateFillPercentage(updated.getFillPercentage());
        }

        Dustbin saved = dustbinRepository.save(existing);
        priorityService.updatePriority(saved);
        return saved;
    }

    @Transactional
    public void deleteDustbin(Long id) {
        Dustbin existing = dustbinRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dustbin not found with id: " + id));
        priorityService.remove(existing.getDustbinCode());
        dustbinRepository.delete(existing);
    }

    @Transactional
    public Dustbin updateSensorFill(String dustbinCode, int newFillPercentage, boolean isSimulated) {
        Dustbin dustbin = dustbinRepository.findByDustbinCode(dustbinCode)
                .orElseThrow(() -> new IllegalArgumentException("Dustbin not found with code: " + dustbinCode));

        int oldFill = dustbin.getFillPercentage();
        dustbin.updateFillPercentage(newFillPercentage);
        Dustbin saved = dustbinRepository.save(dustbin);

        // Synchronize in-memory custom max heap
        priorityService.updatePriority(saved);

        // Automated smart alerts based on filling percentage threshold
        if (newFillPercentage >= 90 && oldFill < 90) {
            notificationService.addAlert(
                    "CRITICAL_FILL",
                    "CRITICAL: Dustbin Overflow Risk!",
                    (isSimulated ? "[SIMULATED] " : "") + "Dustbin " + dustbinCode + " at " +
                            dustbin.getLocationName() + " has reached " + newFillPercentage + "% capacity. Immediate collection required!",
                    "danger"
            );
        } else if (newFillPercentage >= 75 && oldFill < 75) {
            notificationService.addAlert(
                    "HIGH_FILL",
                    "High Fill Level Alert",
                    (isSimulated ? "[SIMULATED] " : "") + "Dustbin " + dustbinCode + " at " +
                            dustbin.getLocationName() + " is now " + newFillPercentage + "% full.",
                    "warning"
            );
        }

        return saved;
    }

    @Transactional
    public List<Dustbin> simulateRandomSensorUpdates() {
        List<Dustbin> all = dustbinRepository.findAll();
        List<Dustbin> updatedBins = new ArrayList<>();
        if (all.isEmpty()) return updatedBins;

        // Pick 4 to 8 random dustbins to update
        int countToUpdate = Math.min(all.size(), 4 + random.nextInt(5));
        List<Dustbin> shuffled = new ArrayList<>(all);
        java.util.Collections.shuffle(shuffled);

        for (int i = 0; i < countToUpdate; i++) {
            Dustbin b = shuffled.get(i);
            int current = b.getFillPercentage();
            // Fluctuate: mostly increase 10-30%, occasional reset or slight decrease
            int delta;
            if (current >= 95) {
                delta = -15; // slightly compact or settle
            } else {
                delta = 10 + random.nextInt(25);
            }
            int newFill = Math.max(0, Math.min(100, current + delta));
            Dustbin updated = updateSensorFill(b.getDustbinCode(), newFill, true);
            updatedBins.add(updated);
        }

        return updatedBins;
    }
}

