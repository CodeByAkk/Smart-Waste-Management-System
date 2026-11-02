package com.smartwaste.service;

import com.smartwaste.dto.DashboardStatsDTO;
import com.smartwaste.entity.Dustbin;
import com.smartwaste.entity.Vehicle;
import com.smartwaste.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AnalyticsService {

    private final DustbinRepository dustbinRepository;
    private final VehicleRepository vehicleRepository;
    private final CollectionHistoryRepository historyRepository;
    private final ComplaintRepository complaintRepository;

    public AnalyticsService(DustbinRepository dustbinRepository,
                            VehicleRepository vehicleRepository,
                            CollectionHistoryRepository historyRepository,
                            ComplaintRepository complaintRepository) {
        this.dustbinRepository = dustbinRepository;
        this.vehicleRepository = vehicleRepository;
        this.historyRepository = historyRepository;
        this.complaintRepository = complaintRepository;
    }

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO dto = new DashboardStatsDTO();

        List<Dustbin> bins = dustbinRepository.findAll();
        long totalBins = bins.size();
        dto.setTotalDustbins(totalBins);

        long empty = bins.stream().filter(b -> b.getFillPercentage() <= 30).count();
        long partial = bins.stream().filter(b -> b.getFillPercentage() > 30 && b.getFillPercentage() < 75).count();
        long almostFull = bins.stream().filter(b -> b.getFillPercentage() >= 75 && b.getFillPercentage() < 90).count();
        long critical = bins.stream().filter(b -> b.getFillPercentage() >= 90).count();

        dto.setEmptyDustbins(empty);
        dto.setPartiallyFilledDustbins(partial);
        dto.setAlmostFullDustbins(almostFull);
        dto.setCompletelyFullDustbins(critical);

        dto.setPendingCollectionRequests(almostFull + critical);

        List<Vehicle> vehicles = vehicleRepository.findAll();
        dto.setTotalVehicles(vehicles.size());
        dto.setAvailableGarbageVehicles(vehicles.stream().filter(v -> v.getStatus() == Vehicle.Status.AVAILABLE).count());

        LocalDateTime startOfToday = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        dto.setTotalCollectionsToday(historyRepository.countCollectionsToday(startOfToday));

        Double totalKg = historyRepository.sumTotalWasteCollected();
        dto.setTotalWasteCollectedKg(totalKg != null ? Math.round(totalKg * 10.0) / 10.0 : 0.0);

        long totalNeeded = almostFull + critical + dto.getTotalCollectionsToday();
        double rate = totalNeeded > 0 ? (dto.getTotalCollectionsToday() * 100.0) / totalNeeded : 100.0;
        dto.setCollectionCompletionRate(Math.min(100.0, Math.round(rate * 10.0) / 10.0));

        // Status Map
        Map<String, Long> statusMap = new LinkedHashMap<>();
        statusMap.put("Empty (0-30%)", empty);
        statusMap.put("Moderate (31-74%)", partial);
        statusMap.put("Almost Full (75-89%)", almostFull);
        statusMap.put("Critical (90-100%)", critical);
        dto.setStatusDistribution(statusMap);

        // Category Map
        Map<String, Long> categoryMap = new LinkedHashMap<>();
        for (Dustbin b : bins) {
            String cat = b.getCategory().name();
            categoryMap.put(cat, categoryMap.getOrDefault(cat, 0L) + 1);
        }
        dto.setCategoryDistribution(categoryMap);

        // 7-Day Daily Trend
        List<DashboardStatsDTO.DailyStat> daily = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("EEE (dd MMM)");
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String label = d.format(dtf);
            // Realistic simulated daily stats curve
            double baseKg = 2400.0 + (Math.sin(i * 1.3) * 600.0) + (i == 0 ? dto.getTotalWasteCollectedKg() * 0.1 : 0);
            int baseCount = (int) Math.round(baseKg / 180.0);
            daily.add(new DashboardStatsDTO.DailyStat(label, Math.round(baseKg), baseCount));
        }
        dto.setDailyStats(daily);

        // Area-wise Statistics
        Map<String, List<Dustbin>> areaMap = new HashMap<>();
        for (Dustbin b : bins) {
            String area = extractAreaName(b.getLocationName());
            areaMap.computeIfAbsent(area, k -> new ArrayList<>()).add(b);
        }

        List<DashboardStatsDTO.AreaWasteStat> areaStats = new ArrayList<>();
        for (Map.Entry<String, List<Dustbin>> entry : areaMap.entrySet()) {
            double totalWasteLiters = entry.getValue().stream().mapToDouble(Dustbin::getCurrentWasteLiters).sum();
            double tons = (totalWasteLiters * 0.00045);
            int avgFill = (int) Math.round(entry.getValue().stream().mapToInt(Dustbin::getFillPercentage).average().orElse(0));
            areaStats.add(new DashboardStatsDTO.AreaWasteStat(entry.getKey(), Math.round(tons * 100.0) / 100.0, entry.getValue().size(), avgFill));
        }
        dto.setAreaWasteStats(areaStats);

        return dto;
    }

    private String extractAreaName(String locationName) {
        if (locationName == null) return "General Area";
        if (locationName.contains(",")) {
            String[] parts = locationName.split(",");
            return parts[parts.length - 1].trim();
        }
        if (locationName.contains("-")) {
            String[] parts = locationName.split("-");
            return parts[parts.length - 1].trim();
        }
        return locationName;
    }
}

