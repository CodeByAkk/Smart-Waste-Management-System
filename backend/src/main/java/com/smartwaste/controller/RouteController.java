package com.smartwaste.controller;

import com.smartwaste.dsa.CityGraph;
import com.smartwaste.dsa.Dijkstra;
import com.smartwaste.dsa.GreedyRouteOptimizer;
import com.smartwaste.dto.OptimizeRouteRequestDTO;
import com.smartwaste.dto.ShortestPathRequestDTO;
import com.smartwaste.service.RouteOptimizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "*")
public class RouteController {

    private final RouteOptimizationService routeService;

    public RouteController(RouteOptimizationService routeService) {
        this.routeService = routeService;
    }

    @PostMapping("/shortest-path")
    public ResponseEntity<Dijkstra.PathResult> computeShortestPath(@RequestBody ShortestPathRequestDTO request) {
        Dijkstra.PathResult result = routeService.computeShortestPath(
                request.getStartLocationCode(),
                request.getEndLocationCode()
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/optimize")
    public ResponseEntity<GreedyRouteOptimizer.OptimizedRouteResult> optimizeRoute(@RequestBody OptimizeRouteRequestDTO request) {
        GreedyRouteOptimizer.OptimizedRouteResult result = routeService.optimizeRoute(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/graph")
    public ResponseEntity<Map<String, Object>> getGraphDetails() {
        CityGraph graph = routeService.getCityGraph();
        Collection<CityGraph.Vertex> vertices = graph.getAllVertices();
        Map<String, List<CityGraph.Edge>> adj = graph.getAdjacencyList();
        return ResponseEntity.ok(Map.of(
                "vertexCount", graph.getVertexCount(),
                "edgeCount", graph.getEdgeCount(),
                "vertices", vertices,
                "adjacencyList", adj
        ));
    }
}

