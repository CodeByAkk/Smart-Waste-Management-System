package com.smartwaste.dsa;

import java.io.Serializable;
import java.util.*;

/**
 * =====================================================================
 * DATA STRUCTURE: WEIGHTED GRAPH (ADJACENCY LIST REPRESENTATION)
 * =====================================================================
 * Models the urban road network connecting depots, intersections, and
 * dustbin collection points.
 * 
 * TIME COMPLEXITY:
 * - Add Vertex:            O(1)
 * - Add Edge:              O(1)
 * - Get Neighbors:         O(1) lookup in adjacency map
 * - Total Graph Storage:   O(V + E) space complexity
 * =====================================================================
 */
public class CityGraph implements Serializable {

    public static class Vertex implements Serializable {
        private String code;       // e.g., "DEPOT-01", "INT-01", "B101"
        private String name;       // "Central Waste Depot", "Shivaji Nagar Square"
        private double latitude;
        private double longitude;
        private String type;       // "DEPOT", "INTERSECTION", "DUSTBIN_POINT", "LANDFILL"

        public Vertex() {}

        public Vertex(String code, String name, double latitude, double longitude, String type) {
            this.code = code;
            this.name = name;
            this.latitude = latitude;
            this.longitude = longitude;
            this.type = type;
        }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }
        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Vertex vertex = (Vertex) o;
            return Objects.equals(code, vertex.code);
        }

        @Override
        public int hashCode() {
            return Objects.hash(code);
        }
    }

    public static class Edge implements Serializable {
        private String sourceCode;
        private String targetCode;
        private double distanceKm;
        private String roadName;

        public Edge() {}

        public Edge(String sourceCode, String targetCode, double distanceKm, String roadName) {
            this.sourceCode = sourceCode;
            this.targetCode = targetCode;
            this.distanceKm = distanceKm;
            this.roadName = roadName;
        }

        public String getSourceCode() { return sourceCode; }
        public String getTargetCode() { return targetCode; }
        public double getDistanceKm() { return distanceKm; }
        public String getRoadName() { return roadName; }
    }

    private final Map<String, Vertex> vertices;
    private final Map<String, List<Edge>> adjacencyList;

    public CityGraph() {
        this.vertices = new LinkedHashMap<>();
        this.adjacencyList = new LinkedHashMap<>();
    }

    /**
     * Add a location vertex to the graph.
     */
    public synchronized void addVertex(Vertex vertex) {
        if (vertex == null || vertex.getCode() == null) return;
        vertices.put(vertex.getCode(), vertex);
        adjacencyList.putIfAbsent(vertex.getCode(), new ArrayList<>());
    }

    /**
     * Add a weighted edge between two locations.
     * Supports both two-way roads (default) and one-way streets.
     */
    public synchronized void addEdge(String fromCode, String toCode, double distanceKm, String roadName, boolean twoWay) {
        if (!vertices.containsKey(fromCode) || !vertices.containsKey(toCode)) {
            return;
        }
        adjacencyList.get(fromCode).add(new Edge(fromCode, toCode, distanceKm, roadName));
        if (twoWay) {
            adjacencyList.get(toCode).add(new Edge(toCode, fromCode, distanceKm, roadName));
        }
    }

    public synchronized Vertex getVertex(String code) {
        return vertices.get(code);
    }

    public synchronized List<Edge> getNeighbors(String code) {
        return adjacencyList.getOrDefault(code, Collections.emptyList());
    }

    public synchronized Collection<Vertex> getAllVertices() {
        return vertices.values();
    }

    public synchronized Map<String, List<Edge>> getAdjacencyList() {
        return Collections.unmodifiableMap(adjacencyList);
    }

    public synchronized int getVertexCount() {
        return vertices.size();
    }

    public synchronized int getEdgeCount() {
        int count = 0;
        for (List<Edge> edges : adjacencyList.values()) {
            count += edges.size();
        }
        return count / 2; // Undirected count
    }

    public synchronized void clear() {
        vertices.clear();
        adjacencyList.clear();
    }
}

