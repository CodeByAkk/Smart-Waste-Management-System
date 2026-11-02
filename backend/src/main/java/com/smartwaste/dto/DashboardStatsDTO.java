package com.smartwaste.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDTO {
    private long totalDustbins;
    private long emptyDustbins;
    private long partiallyFilledDustbins;
    private long almostFullDustbins;
    private long completelyFullDustbins;
    private long pendingCollectionRequests;
    private long availableGarbageVehicles;
    private long totalVehicles;
    private long totalCollectionsToday;
    private double totalWasteCollectedKg;
    private double collectionCompletionRate;

    // Charts data
    private Map<String, Long> statusDistribution;
    private Map<String, Long> categoryDistribution;
    private List<DailyStat> dailyStats;
    private List<AreaWasteStat> areaWasteStats;

    public static class DailyStat {
        private String day;
        private double wasteCollectedKg;
        private int collectionsCount;

        public DailyStat(String day, double wasteCollectedKg, int collectionsCount) {
            this.day = day;
            this.wasteCollectedKg = wasteCollectedKg;
            this.collectionsCount = collectionsCount;
        }

        public String getDay() { return day; }
        public double getWasteCollectedKg() { return wasteCollectedKg; }
        public int getCollectionsCount() { return collectionsCount; }
    }

    public static class AreaWasteStat {
        private String areaName;
        private double wasteTons;
        private int dustbinsCount;
        private int avgFillPercentage;

        public AreaWasteStat(String areaName, double wasteTons, int dustbinsCount, int avgFillPercentage) {
            this.areaName = areaName;
            this.wasteTons = wasteTons;
            this.dustbinsCount = dustbinsCount;
            this.avgFillPercentage = avgFillPercentage;
        }

        public String getAreaName() { return areaName; }
        public double getWasteTons() { return wasteTons; }
        public int getDustbinsCount() { return dustbinsCount; }
        public int getAvgFillPercentage() { return avgFillPercentage; }
    }

    public DashboardStatsDTO() {}

    // Getters and Setters
    public long getTotalDustbins() { return totalDustbins; }
    public void setTotalDustbins(long totalDustbins) { this.totalDustbins = totalDustbins; }
    public long getEmptyDustbins() { return emptyDustbins; }
    public void setEmptyDustbins(long emptyDustbins) { this.emptyDustbins = emptyDustbins; }
    public long getPartiallyFilledDustbins() { return partiallyFilledDustbins; }
    public void setPartiallyFilledDustbins(long partiallyFilledDustbins) { this.partiallyFilledDustbins = partiallyFilledDustbins; }
    public long getAlmostFullDustbins() { return almostFullDustbins; }
    public void setAlmostFullDustbins(long almostFullDustbins) { this.almostFullDustbins = almostFullDustbins; }
    public long getCompletelyFullDustbins() { return completelyFullDustbins; }
    public void setCompletelyFullDustbins(long completelyFullDustbins) { this.completelyFullDustbins = completelyFullDustbins; }
    public long getPendingCollectionRequests() { return pendingCollectionRequests; }
    public void setPendingCollectionRequests(long pendingCollectionRequests) { this.pendingCollectionRequests = pendingCollectionRequests; }
    public long getAvailableGarbageVehicles() { return availableGarbageVehicles; }
    public void setAvailableGarbageVehicles(long availableGarbageVehicles) { this.availableGarbageVehicles = availableGarbageVehicles; }
    public long getTotalVehicles() { return totalVehicles; }
    public void setTotalVehicles(long totalVehicles) { this.totalVehicles = totalVehicles; }
    public long getTotalCollectionsToday() { return totalCollectionsToday; }
    public void setTotalCollectionsToday(long totalCollectionsToday) { this.totalCollectionsToday = totalCollectionsToday; }
    public double getTotalWasteCollectedKg() { return totalWasteCollectedKg; }
    public void setTotalWasteCollectedKg(double totalWasteCollectedKg) { this.totalWasteCollectedKg = totalWasteCollectedKg; }
    public double getCollectionCompletionRate() { return collectionCompletionRate; }
    public void setCollectionCompletionRate(double collectionCompletionRate) { this.collectionCompletionRate = collectionCompletionRate; }
    public Map<String, Long> getStatusDistribution() { return statusDistribution; }
    public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }
    public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }
    public List<DailyStat> getDailyStats() { return dailyStats; }
    public void setDailyStats(List<DailyStat> dailyStats) { this.dailyStats = dailyStats; }
    public List<AreaWasteStat> getAreaWasteStats() { return areaWasteStats; }
    public void setAreaWasteStats(List<AreaWasteStat> areaWasteStats) { this.areaWasteStats = areaWasteStats; }
}
