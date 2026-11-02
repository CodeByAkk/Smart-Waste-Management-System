package com.smartwaste.service;

import com.smartwaste.dto.CompleteCollectionRequestDTO;
import com.smartwaste.entity.*;
import com.smartwaste.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CollectionService {

    private final CollectionHistoryRepository historyRepository;
    private final DustbinRepository dustbinRepository;
    private final CollectionStaffRepository staffRepository;
    private final VehicleRepository vehicleRepository;
    private final PriorityService priorityService;
    private final NotificationService notificationService;

    public CollectionService(CollectionHistoryRepository historyRepository,
                             DustbinRepository dustbinRepository,
                             CollectionStaffRepository staffRepository,
                             VehicleRepository vehicleRepository,
                             PriorityService priorityService,
                             NotificationService notificationService) {
        this.historyRepository = historyRepository;
        this.dustbinRepository = dustbinRepository;
        this.staffRepository = staffRepository;
        this.vehicleRepository = vehicleRepository;
        this.priorityService = priorityService;
        this.notificationService = notificationService;
    }

    public List<CollectionHistory> getAllHistory() {
        return historyRepository.findByOrderByCollectionDateDesc();
    }

    @Transactional
    public CollectionHistory completeCollection(CompleteCollectionRequestDTO request) {
        Dustbin dustbin = dustbinRepository.findByDustbinCode(request.getDustbinCode())
                .orElseThrow(() -> new IllegalArgumentException("Dustbin not found: " + request.getDustbinCode()));

        CollectionStaff staff = null;
        if (request.getStaffId() != null) {
            staff = staffRepository.findById(request.getStaffId()).orElse(null);
        }

        Vehicle vehicle = null;
        if (request.getVehicleId() != null) {
            vehicle = vehicleRepository.findById(request.getVehicleId()).orElse(null);
        }

        int previousFill = dustbin.getFillPercentage();
        double collectedLiters = dustbin.getCurrentWasteLiters();
        double wasteKg = (request.getCollectedWasteQuantity() != null && request.getCollectedWasteQuantity() > 0)
                ? request.getCollectedWasteQuantity()
                : (collectedLiters * 0.45);

        // 1. Reset dustbin fill to 0% and record last collection date
        dustbin.updateFillPercentage(0);
        dustbin.setStatus(Dustbin.Status.EMPTY);
        dustbin.setLastCollectionDate(LocalDateTime.now());
        dustbinRepository.save(dustbin);

        // 2. Update priority queue
        priorityService.updatePriority(dustbin);

        // 3. Create collection history record
        String code = "COL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        CollectionHistory history = new CollectionHistory(
                code,
                dustbin.getId(),
                dustbin.getDustbinCode(),
                staff != null ? staff.getId() : null,
                staff != null ? staff.getName() : "Collection Team A",
                vehicle != null ? vehicle.getId() : null,
                vehicle != null ? vehicle.getVehicleNumber() : "MH-12-GW-9001",
                previousFill,
                wasteKg
        );
        CollectionHistory savedHistory = historyRepository.save(history);

        // 4. Update staff completion counter
        if (staff != null) {
            staff.setCompletedCollections(staff.getCompletedCollections() + 1);
            staffRepository.save(staff);
        }

        // 5. Update vehicle accumulated load
        if (vehicle != null) {
            vehicle.setCollectedWasteCapacity(vehicle.getCollectedWasteCapacity() + wasteKg);
            vehicleRepository.save(vehicle);
        }

        // 6. Alert system
        notificationService.addAlert(
                "COLLECTION",
                "Dustbin Collected Successfully",
                "Dustbin " + dustbin.getDustbinCode() + " emptied (previously " + previousFill + "%). " +
                        Math.round(wasteKg) + " kg waste collected.",
                "success"
        );

        return savedHistory;
    }
}
