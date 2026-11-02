package com.smartwaste.dsa;

import java.io.Serializable;
import java.util.*;

/**
 * =====================================================================
 * ALGORITHM: PRIORITY-AWARE GREEDY ROUTE OPTIMIZER
 * =====================================================================
 * Solves the Multi-Stop Waste Collection Vehicle Routing Problem (VRP).
 * 
 * ALGORITHMIC DISTINCTION NOTE:
 * Dijkstra's algorithm computes the exact point-to-point shortest path
 * between any two individual nodes. The multi-stop route optimization problem
 * across multiple collection targets is NP-hard (related to TSP/VRP).
 * We employ a Priority-Aware Greedy Heuristic:
 * 
 * At each stop, from current position 'u':
 * 1. Find candidate uncollected high-priority dustbins that fit within vehicle capacity.
 * 2. Compute the shortest path to each candidate using Dijkstra's Algorithm.
 * 3. Evaluate greedy fitness metric:
 *       Score = (PriorityWeight * 100) / (DijkstraDistance + 0.5)
 *    where PriorityWeight: Critical = 4.0, High = 3.0, Medium = 2.0, Low = 1.0.
 * 4. Select candidate with maximum score as next stop.
 * 5. Update vehicle accumulated load and current position.
 * 6. Repeat until capacity full or all urgent targets visited.
 * 7. Finally, calculate the shortest path back to the starting Central Depot using Dijkstra.
 * =====================================================================
 */
public class GreedyRouteOptimizer {

    public static class CollectionStop implements Serializable {
        private int stopOrder;
        private String locationCode;
        private String locationName;
        private double latitude;
        private double longitude;
        private String dustbinCode; // Null for depot
        private int fillPercentage;
        private double wasteQuantityKg;
        private double segmentDistanceKm;
        private double cumulativeDistanceKm;
        private String stopType; // "DEPOT_START", "COLLECTION_STOP", "DEPOT_RETURN"
        private List<String> pathToNextStop; // Detailed intersection hops from Dijkstra

        public CollectionStop() {
            this.pathToNextStop = new ArrayList<>();
        }

        // Getters and Setters
        public int getStopOrder() { return stopOrder; }
        public void setStopOrder(int stopOrder) { this.stopOrder = stopOrder; }
        public String getLocationCode() { return locationCode; }
        public void setLocationCode(String locationCode) { this.locationCode = locationCode; }
        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }
        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }
        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }
        public String getDustbinCode() { return dustbinCode; }
        public void setDustbinCode(String dustbinCode) { this.dustbinCode = dustbinCode; }
        public int getFillPercentage() { return fillPercentage; }
        public void setFillPercentage(int fillPercentage) { this.fillPercentage = fillPercentage; }
        public double getWasteQuantityKg() { return wasteQuantityKg; }
        public void setWasteQuantityKg(double wasteQuantityKg) { this.wasteQuantityKg = wasteQuantityKg; }
        public double getSegmentDistanceKm() { return Math.round(segmentDistanceKm * 100.0) / 100.0; }
        public void setSegmentDistanceKm(double segmentDistanceKm) { this.segmentDistanceKm = segmentDistanceKm; }
        public double getCumulativeDistanceKm() { return Math.round(cumulativeDistanceKm * 100.0) / 100.0; }
        public void setCumulativeDistanceKm(double cumulativeDistanceKm) { this.cumulativeDistanceKm = cumulativeDistanceKm; }
        public String getStopType() { return stopType; }
        public void setStopType(String stopType) { this.stopType = stopType; }
        public List<String> getPathToNextStop() { return pathToNextStop; }
        public void setPathToNextStop(List<String> pathToNextStop) { this.pathToNextStop = pathToNextStop; }
    }

    public static class CandidateDustbin implements Serializable {
        private String dustbinCode;
        private String locationCode;
        private String locationName;
        private double latitude;
        private double longitude;
        private int fillPercentage;
        private double wasteQuantityKg;
        private String priorityLevel;

        public CandidateDustbin(String dustbinCode, String locationCode, String locationName,
                                double latitude, double longitude, int fillPercentage,
                                double wasteQuantityKg, String priorityLevel) {
            this.dustbinCode = dustbinCode;
            this.locationCode = locationCode;
            this.locationName = locationName;
            this.latitude = latitude;
            this.longitude = longitude;
            this.fillPercentage = fillPercentage;
            this.wasteQuantityKg = wasteQuantityKg;
            this.priorityLevel = priorityLevel;
        }

        public double getPriorityWeight() {
            if ("CRITICAL".equalsIgnoreCase(priorityLevel)) return 4.0;
            if ("HIGH".equalsIgnoreCase(priorityLevel)) return 3.0;
            if ("MEDIUM".equalsIgnoreCase(priorityLevel)) return 2.0;
            return 1.0;
        }

        public String getDustbinCode() { return dustbinCode; }
        public String getLocationCode() { return locationCode; }
        public String getLocationName() { return locationName; }
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
        public int getFillPercentage() { return fillPercentage; }
        public double getWasteQuantityKg() { return wasteQuantityKg; }
        public String getPriorityLevel() { return priorityLevel; }
    }

    public static class OptimizedRouteResult implements Serializable {
        private String vehicleId;
        private String vehicleNumber;
        private String startDepotCode;
        private String startDepotName;
        private double totalDistanceKm;
        private int totalStopsCount;
        private int estimatedDurationMinutes;
        private double totalWasteToCollectKg;
        private double vehicleCapacityKg;
        private List<CollectionStop> stops;
        private List<CityGraph.Vertex> fullPolylineVertices;
        private String algorithmExplanation;

        public OptimizedRouteResult() {
            this.stops = new ArrayList<>();
            this.fullPolylineVertices = new ArrayList<>();
        }

        // Getters and Setters
        public String getVehicleId() { return vehicleId; }
        public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }
        public String getVehicleNumber() { return vehicleNumber; }
        public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
        public String getStartDepotCode() { return startDepotCode; }
        public void setStartDepotCode(String startDepotCode) { this.startDepotCode = startDepotCode; }
        public String getStartDepotName() { return startDepotName; }
        public void setStartDepotName(String startDepotName) { this.startDepotName = startDepotName; }
        public double getTotalDistanceKm() { return Math.round(totalDistanceKm * 100.0) / 100.0; }
        public void setTotalDistanceKm(double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }
        public int getTotalStopsCount() { return totalStopsCount; }
        public void setTotalStopsCount(int totalStopsCount) { this.totalStopsCount = totalStopsCount; }
        public int getEstimatedDurationMinutes() { return estimatedDurationMinutes; }
        public void setEstimatedDurationMinutes(int estimatedDurationMinutes) { this.estimatedDurationMinutes = estimatedDurationMinutes; }
        public double getTotalWasteToCollectKg() { return Math.round(totalWasteToCollectKg * 100.0) / 100.0; }
        public void setTotalWasteToCollectKg(double totalWasteToCollectKg) { this.totalWasteToCollectKg = totalWasteToCollectKg; }
        public double getVehicleCapacityKg() { return vehicleCapacityKg; }
        public void setVehicleCapacityKg(double vehicleCapacityKg) { this.vehicleCapacityKg = vehicleCapacityKg; }
        public List<CollectionStop> getStops() { return stops; }
        public void setStops(List<CollectionStop> stops) { this.stops = stops; }
        public List<CityGraph.Vertex> getFullPolylineVertices() { return fullPolylineVertices; }
        public void setFullPolylineVertices(List<CityGraph.Vertex> fullPolylineVertices) { this.fullPolylineVertices = fullPolylineVertices; }
        public String getAlgorithmExplanation() { return algorithmExplanation; }
        public void setAlgorithmExplanation(String algorithmExplanation) { this.algorithmExplanation = algorithmExplanation; }
    }

    /**
     * Optimizes a multi-stop collection tour.
     */
    public static OptimizedRouteResult optimizeRoute(
            CityGraph graph,
            String startDepotCode,
            List<CandidateDustbin> candidateBins,
            String vehicleId,
            String vehicleNumber,
            double vehicleCapacityKg) {

        OptimizedRouteResult result = new OptimizedRouteResult();
        result.setVehicleId(vehicleId);
        result.setVehicleNumber(vehicleNumber);
        result.setStartDepotCode(startDepotCode);
        result.setVehicleCapacityKg(vehicleCapacityKg);

        CityGraph.Vertex depotVertex = graph.getVertex(startDepotCode);
        if (depotVertex == null) {
            result.setAlgorithmExplanation("Error: Specified depot node '" + startDepotCode + "' not found in road network.");
            return result;
        }
        result.setStartDepotName(depotVertex.getName());

        List<CandidateDustbin> remaining = new ArrayList<>(candidateBins);
        List<CollectionStop> stops = new ArrayList<>();
        List<CityGraph.Vertex> fullPolyline = new ArrayList<>();

        double cumulativeDistance = 0.0;
        double accumulatedWasteKg = 0.0;
        int orderCounter = 1;

        // 1. Initial Stop: Depot Start
        CollectionStop depotStart = new CollectionStop();
        depotStart.setStopOrder(orderCounter++);
        depotStart.setLocationCode(depotVertex.getCode());
        depotStart.setLocationName(depotVertex.getName());
        depotStart.setLatitude(depotVertex.getLatitude());
        depotStart.setLongitude(depotVertex.getLongitude());
        depotStart.setStopType("DEPOT_START");
        depotStart.setSegmentDistanceKm(0.0);
        depotStart.setCumulativeDistanceKm(0.0);
        stops.add(depotStart);
        fullPolyline.add(depotVertex);

        String currentLocationCode = startDepotCode;

        // 2. Greedy Loop over candidates
        while (!remaining.isEmpty()) {
            CandidateDustbin bestCandidate = null;
            Dijkstra.PathResult bestPath = null;
            double maxScore = -1.0;
            int bestIndex = -1;

            for (int i = 0; i < remaining.size(); i++) {
                CandidateDustbin cand = remaining.get(i);
                // Check vehicle capacity limit
                if (accumulatedWasteKg + cand.getWasteQuantityKg() > vehicleCapacityKg) {
                    continue;
                }

                // Calculate shortest path using Dijkstra
                Dijkstra.PathResult path = Dijkstra.findShortestPath(graph, currentLocationCode, cand.getLocationCode());
                if (!path.isFound()) continue;

                // Priority-Aware Greedy Score: (PriorityWeight * 100) / (Distance + 0.5)
                double dist = path.getTotalDistanceKm();
                double score = (cand.getPriorityWeight() * 100.0) / (dist + 0.5);

                if (score > maxScore) {
                    maxScore = score;
                    bestCandidate = cand;
                    bestPath = path;
                    bestIndex = i;
                }
            }

            // If no candidate fits or no path reachable, break
            if (bestCandidate == null || bestPath == null) {
                break;
            }

            // Remove selected candidate
            remaining.remove(bestIndex);

            // Append intermediate polyline nodes from Dijkstra
            for (int j = 1; j < bestPath.getPathVertices().size(); j++) {
                fullPolyline.add(bestPath.getPathVertices().get(j));
            }

            // Add collection stop
            cumulativeDistance += bestPath.getTotalDistanceKm();
            accumulatedWasteKg += bestCandidate.getWasteQuantityKg();

            CollectionStop stop = new CollectionStop();
            stop.setStopOrder(orderCounter++);
            stop.setLocationCode(bestCandidate.getLocationCode());
            stop.setLocationName(bestCandidate.getLocationName());
            stop.setLatitude(bestCandidate.getLatitude());
            stop.setLongitude(bestCandidate.getLongitude());
            stop.setDustbinCode(bestCandidate.getDustbinCode());
            stop.setFillPercentage(bestCandidate.getFillPercentage());
            stop.setWasteQuantityKg(bestCandidate.getWasteQuantityKg());
            stop.setSegmentDistanceKm(bestPath.getTotalDistanceKm());
            stop.setCumulativeDistanceKm(cumulativeDistance);
            stop.setStopType("COLLECTION_STOP");
            stop.setPathToNextStop(bestPath.getPathCodes());

            stops.add(stop);
            currentLocationCode = bestCandidate.getLocationCode();
        }

        // 3. Return to Central Depot
        Dijkstra.PathResult returnPath = Dijkstra.findShortestPath(graph, currentLocationCode, startDepotCode);
        double returnDist = returnPath.isFound() ? returnPath.getTotalDistanceKm() : 0.0;
        cumulativeDistance += returnDist;

        if (returnPath.isFound()) {
            for (int j = 1; j < returnPath.getPathVertices().size(); j++) {
                fullPolyline.add(returnPath.getPathVertices().get(j));
            }
        }

        CollectionStop depotReturn = new CollectionStop();
        depotReturn.setStopOrder(orderCounter);
        depotReturn.setLocationCode(depotVertex.getCode());
        depotReturn.setLocationName(depotVertex.getName() + " (Final Unloading)");
        depotReturn.setLatitude(depotVertex.getLatitude());
        depotReturn.setLongitude(depotVertex.getLongitude());
        depotReturn.setStopType("DEPOT_RETURN");
        depotReturn.setSegmentDistanceKm(returnDist);
        depotReturn.setCumulativeDistanceKm(cumulativeDistance);
        if (returnPath.isFound()) {
            depotReturn.setPathToNextStop(returnPath.getPathCodes());
        }
        stops.add(depotReturn);

        // 4. Calculate Duration: Avg 25 km/h driving speed (2.4 min per km) + 8 minutes service time per collection stop
        int collectionStopsCount = stops.size() - 2; // Minus start and return depot
        int drivingMinutes = (int) Math.round(cumulativeDistance * 2.4);
        int serviceMinutes = Math.max(0, collectionStopsCount) * 8;
        int totalDuration = drivingMinutes + serviceMinutes;

        result.setStops(stops);
        result.setTotalStopsCount(Math.max(0, collectionStopsCount));
        result.setTotalDistanceKm(cumulativeDistance);
        result.setTotalWasteToCollectKg(accumulatedWasteKg);
        result.setEstimatedDurationMinutes(totalDuration);
        result.setFullPolylineVertices(fullPolyline);
        result.setAlgorithmExplanation(
                "Greedy Priority-Aware TSP/VRP Heuristic executed with " + collectionStopsCount + " collection stops. " +
                "Each inter-stop road segment was precisely routed via Dijkstra's Shortest Path Algorithm over the city graph. " +
                "Vehicle capacity utilization: " + Math.round((accumulatedWasteKg / vehicleCapacityKg) * 100.0) + "%."
        );

        return result;
    }
}

