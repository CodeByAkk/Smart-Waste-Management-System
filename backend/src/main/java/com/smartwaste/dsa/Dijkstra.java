package com.smartwaste.dsa;

import java.io.Serializable;
import java.util.*;

/**
 * =====================================================================
 * ALGORITHM: DIJKSTRA'S SHORTEST PATH ALGORITHM
 * =====================================================================
 * Computes the minimum road distance between any two locations in the city.
 * Uses a Priority Queue (Min-Heap) for optimal performance.
 * 
 * TIME COMPLEXITY:
 * - O((V + E) * log V) with binary heap priority queue.
 * - In our dense road graph: O(E log V).
 * 
 * SPACE COMPLEXITY:
 * - O(V) for distances, predecessors, and priority queue states.
 * =====================================================================
 */
public class Dijkstra {

    public static class StepTrace implements Serializable {
        private int stepNumber;
        private String currentVertex;
        private double currentDistance;
        private String evaluatedNeighbor;
        private double edgeWeight;
        private double updatedDistance;
        private String status; // "UPDATED", "REMAINED_SHORTER", "SETTLED"

        public StepTrace(int stepNumber, String currentVertex, double currentDistance,
                         String evaluatedNeighbor, double edgeWeight, double updatedDistance, String status) {
            this.stepNumber = stepNumber;
            this.currentVertex = currentVertex;
            this.currentDistance = currentDistance;
            this.evaluatedNeighbor = evaluatedNeighbor;
            this.edgeWeight = edgeWeight;
            this.updatedDistance = updatedDistance;
            this.status = status;
        }

        public int getStepNumber() { return stepNumber; }
        public String getCurrentVertex() { return currentVertex; }
        public double getCurrentDistance() { return currentDistance; }
        public String getEvaluatedNeighbor() { return evaluatedNeighbor; }
        public double getEdgeWeight() { return edgeWeight; }
        public double getUpdatedDistance() { return updatedDistance; }
        public String getStatus() { return status; }
    }

    public static class PathResult implements Serializable {
        private String startCode;
        private String endCode;
        private double totalDistanceKm;
        private List<CityGraph.Vertex> pathVertices;
        private List<String> pathCodes;
        private List<String> roadNames;
        private List<StepTrace> executionTrace;
        private Map<String, Double> allShortestDistances;
        private boolean found;

        public PathResult() {
            this.pathVertices = new ArrayList<>();
            this.pathCodes = new ArrayList<>();
            this.roadNames = new ArrayList<>();
            this.executionTrace = new ArrayList<>();
            this.allShortestDistances = new HashMap<>();
            this.found = false;
        }

        public String getStartCode() { return startCode; }
        public void setStartCode(String startCode) { this.startCode = startCode; }
        public String getEndCode() { return endCode; }
        public void setEndCode(String endCode) { this.endCode = endCode; }
        public double getTotalDistanceKm() { return Math.round(totalDistanceKm * 100.0) / 100.0; }
        public void setTotalDistanceKm(double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }
        public List<CityGraph.Vertex> getPathVertices() { return pathVertices; }
        public void setPathVertices(List<CityGraph.Vertex> pathVertices) { this.pathVertices = pathVertices; }
        public List<String> getPathCodes() { return pathCodes; }
        public void setPathCodes(List<String> pathCodes) { this.pathCodes = pathCodes; }
        public List<String> getRoadNames() { return roadNames; }
        public void setRoadNames(List<String> roadNames) { this.roadNames = roadNames; }
        public List<StepTrace> getExecutionTrace() { return executionTrace; }
        public void setExecutionTrace(List<StepTrace> executionTrace) { this.executionTrace = executionTrace; }
        public Map<String, Double> getAllShortestDistances() { return allShortestDistances; }
        public void setAllShortestDistances(Map<String, Double> allShortestDistances) { this.allShortestDistances = allShortestDistances; }
        public boolean isFound() { return found; }
        public void setFound(boolean found) { this.found = found; }
    }

    private static class NodeRecord implements Comparable<NodeRecord> {
        String code;
        double distance;

        NodeRecord(String code, double distance) {
            this.code = code;
            this.distance = distance;
        }

        @Override
        public int compareTo(NodeRecord o) {
            return Double.compare(this.distance, o.distance);
        }
    }

    /**
     * Finds the shortest path from startCode to endCode in cityGraph.
     */
    public static PathResult findShortestPath(CityGraph graph, String startCode, String endCode) {
        PathResult result = new PathResult();
        result.setStartCode(startCode);
        result.setEndCode(endCode);

        if (graph == null || graph.getVertex(startCode) == null || graph.getVertex(endCode) == null) {
            return result;
        }

        Map<String, Double> distances = new HashMap<>();
        Map<String, String> predecessors = new HashMap<>();
        Map<String, String> roadUsed = new HashMap<>();
        PriorityQueue<NodeRecord> pq = new PriorityQueue<>();
        Set<String> visited = new HashSet<>();
        List<StepTrace> trace = new ArrayList<>();
        int stepCounter = 1;

        // Initialize distances
        for (CityGraph.Vertex v : graph.getAllVertices()) {
            distances.put(v.getCode(), Double.POSITIVE_INFINITY);
        }
        distances.put(startCode, 0.0);
        pq.add(new NodeRecord(startCode, 0.0));

        while (!pq.isEmpty()) {
            NodeRecord current = pq.poll();
            String u = current.code;

            if (visited.contains(u)) continue;
            visited.add(u);

            trace.add(new StepTrace(stepCounter++, u, current.distance, "-", 0.0, current.distance, "SETTLED"));

            // If we reached target, we can record settled state
            if (u.equals(endCode)) {
                break;
            }

            for (CityGraph.Edge edge : graph.getNeighbors(u)) {
                String v = edge.getTargetCode();
                if (visited.contains(v)) continue;

                double newDist = distances.get(u) + edge.getDistanceKm();
                if (newDist < distances.get(v)) {
                    distances.put(v, newDist);
                    predecessors.put(v, u);
                    roadUsed.put(v, edge.getRoadName());
                    pq.add(new NodeRecord(v, newDist));
                    trace.add(new StepTrace(stepCounter++, u, current.distance, v, edge.getDistanceKm(), newDist, "UPDATED"));
                } else {
                    trace.add(new StepTrace(stepCounter++, u, current.distance, v, edge.getDistanceKm(), distances.get(v), "REMAINED_SHORTER"));
                }
            }
        }

        result.setExecutionTrace(trace);
        result.setAllShortestDistances(distances);

        double targetDistance = distances.getOrDefault(endCode, Double.POSITIVE_INFINITY);
        if (targetDistance != Double.POSITIVE_INFINITY) {
            result.setFound(true);
            result.setTotalDistanceKm(targetDistance);

            // Reconstruct path backward from destination to source
            LinkedList<String> pathCodes = new LinkedList<>();
            LinkedList<CityGraph.Vertex> pathVertices = new LinkedList<>();
            LinkedList<String> roads = new LinkedList<>();

            String curr = endCode;
            while (curr != null) {
                pathCodes.addFirst(curr);
                pathVertices.addFirst(graph.getVertex(curr));
                String r = roadUsed.get(curr);
                if (r != null) {
                    roads.addFirst(r);
                }
                curr = predecessors.get(curr);
            }

            result.setPathCodes(pathCodes);
            result.setPathVertices(pathVertices);
            result.setRoadNames(roads);
        }

        return result;
    }
}

