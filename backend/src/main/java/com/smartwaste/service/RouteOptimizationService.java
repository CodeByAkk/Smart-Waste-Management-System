package com.smartwaste.service;

import com.smartwaste.dsa.CityGraph;
import com.smartwaste.dsa.Dijkstra;
import com.smartwaste.dsa.GreedyRouteOptimizer;
import com.smartwaste.dto.OptimizeRouteRequestDTO;
import com.smartwaste.entity.*;
import com.smartwaste.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RouteOptimizationService {

    private final CityLocationRepository cityLocationRepository;
    private final RoadConnectionRepository roadConnectionRepository;
    private final DustbinRepository dustbinRepository;
    private final VehicleRepository vehicleRepository;
    private final CityGraph cityGraph = new CityGraph();

    public RouteOptimizationService(CityLocationRepository cityLocationRepository,
                                    RoadConnectionRepository roadConnectionRepository,
                                    DustbinRepository dustbinRepository,
                                    VehicleRepository vehicleRepository) {
        this.cityLocationRepository = cityLocationRepository;
        this.roadConnectionRepository = roadConnectionRepository;
        this.dustbinRepository = dustbinRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @PostConstruct
    public synchronized void reloadGraph() {
        cityGraph.clear();

        // 1. Add city locations (depots, major intersections)
        List<CityLocation> locations = cityLocationRepository.findAll();
        for (CityLocation loc : locations) {
            cityGraph.addVertex(new CityGraph.Vertex(
                    loc.getLocationCode(),
                    loc.getName(),
                    loc.getLatitude(),
                    loc.getLongitude(),
                    loc.getLocationType().name()
            ));
        }

        // 2. Add dustbins as graph vertices
        List<Dustbin> dustbins = dustbinRepository.findAll();
        for (Dustbin bin : dustbins) {
            cityGraph.addVertex(new CityGraph.Vertex(
                    bin.getDustbinCode(),
                    bin.getLocationName(),
                    bin.getLatitude(),
                    bin.getLongitude(),
                    "DUSTBIN_POINT"
            ));
        }

        // 3. Add road connections
        List<RoadConnection> connections = roadConnectionRepository.findAll();
        for (RoadConnection rc : connections) {
            cityGraph.addEdge(
                    rc.getSourceLocationCode(),
                    rc.getTargetLocationCode(),
                    rc.getDistanceKm(),
                    rc.getRoadName(),
                    rc.getIsTwoWay() != null ? rc.getIsTwoWay() : true
            );
        }

        // 4. Ensure each dustbin is connected to the nearest intersection in the graph
        connectDustbinsToNearestIntersections(dustbins, locations);
    }

    private void connectDustbinsToNearestIntersections(List<Dustbin> bins, List<CityLocation> intersections) {
        if (intersections.isEmpty()) return;
        for (Dustbin bin : bins) {
            // Find 1 or 2 closest intersections using Haversine distance
            CityLocation nearest = null;
            double minDistance = Double.MAX_VALUE;

            for (CityLocation loc : intersections) {
                double dist = calculateHaversineDistance(
                        bin.getLatitude(), bin.getLongitude(),
                        loc.getLatitude(), loc.getLongitude()
                );
                if (dist < minDistance) {
                    minDistance = dist;
                    nearest = loc;
                }
            }

            if (nearest != null) {
                // Add local connector road (at least 0.2 km)
                double roadDist = Math.max(0.2, Math.round(minDistance * 100.0) / 100.0);
                cityGraph.addEdge(
                        bin.getDustbinCode(),
                        nearest.getLocationCode(),
                        roadDist,
                        "Access Lane to " + nearest.getName(),
                        true
                );
            }
        }
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the Earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public CityGraph getCityGraph() {
        return cityGraph;
    }

    public Dijkstra.PathResult computeShortestPath(String fromCode, String toCode) {
        return Dijkstra.findShortestPath(cityGraph, fromCode, toCode);
    }

    public GreedyRouteOptimizer.OptimizedRouteResult optimizeRoute(OptimizeRouteRequestDTO request) {
        reloadGraph();

        String vehicleId = request.getVehicleId();
        Vehicle vehicle = null;
        if (vehicleId != null && !vehicleId.trim().isEmpty()) {
            vehicle = vehicleRepository.findById(Long.parseLong(vehicleId)).orElse(null);
        }
        if (vehicle == null) {
            // Default to first available vehicle or create standard representation
            List<Vehicle> available = vehicleRepository.findByStatus(Vehicle.Status.AVAILABLE);
            vehicle = available.isEmpty() ? vehicleRepository.findAll().stream().findFirst().orElse(null) : available.get(0);
        }

        String vId = vehicle != null ? vehicle.getId().toString() : "V-01";
        String vNumber = vehicle != null ? vehicle.getVehicleNumber() : "MH-12-GW-9001";
        double capacityKg = vehicle != null ? vehicle.getCapacityKg() : 3500.0;

        int threshold = request.getMinimumFillThreshold() != null ? request.getMinimumFillThreshold() : 75;
        List<Dustbin> targetBins;

        if (request.getSpecificDustbinCodes() != null && !request.getSpecificDustbinCodes().isEmpty()) {
            targetBins = new ArrayList<>();
            for (String code : request.getSpecificDustbinCodes()) {
                dustbinRepository.findByDustbinCode(code).ifPresent(targetBins::add);
            }
        } else {
            targetBins = dustbinRepository.findHighPriorityBins(threshold);
            // If none above threshold, take top 6 most filled bins
            if (targetBins.isEmpty()) {
                targetBins = dustbinRepository.findAll().stream()
                        .sorted(Comparator.comparingInt(Dustbin::getFillPercentage).reversed())
                        .limit(8)
                        .toList();
            }
        }

        List<GreedyRouteOptimizer.CandidateDustbin> candidates = new ArrayList<>();
        for (Dustbin b : targetBins) {
            double wasteKg = (b.getCurrentWasteLiters() * 0.45); // Avg compacted density: 0.45 kg/liter
            candidates.add(new GreedyRouteOptimizer.CandidateDustbin(
                    b.getDustbinCode(),
                    b.getDustbinCode(),
                    b.getLocationName(),
                    b.getLatitude(),
                    b.getLongitude(),
                    b.getFillPercentage(),
                    wasteKg,
                    b.getPriorityLevel().name()
            ));
        }

        String startDepot = (request.getStartDepotCode() != null && !request.getStartDepotCode().trim().isEmpty())
                ? request.getStartDepotCode()
                : "DEPOT-01";

        return GreedyRouteOptimizer.optimizeRoute(
                cityGraph,
                startDepot,
                candidates,
                vId,
                vNumber,
                capacityKg
        );
    }
}
