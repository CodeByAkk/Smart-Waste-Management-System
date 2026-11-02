package com.smartwaste.controller;

import com.smartwaste.dsa.CityGraph;
import com.smartwaste.dsa.CustomMaxHeap;
import com.smartwaste.dsa.CustomMergeSort;
import com.smartwaste.dsa.Dijkstra;
import com.smartwaste.dto.MergeSortDemoRequestDTO;
import com.smartwaste.dto.ShortestPathRequestDTO;
import com.smartwaste.service.PriorityService;
import com.smartwaste.service.RouteOptimizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dsa")
@CrossOrigin(origins = "*")
public class DsaDemoController {

    private final PriorityService priorityService;
    private final RouteOptimizationService routeService;

    public DsaDemoController(PriorityService priorityService, RouteOptimizationService routeService) {
        this.priorityService = priorityService;
        this.routeService = routeService;
    }

    @PostMapping("/mergesort")
    public ResponseEntity<CustomMergeSort.MergeSortResult<Integer>> runMergeSortDemo(@RequestBody MergeSortDemoRequestDTO request) {
        List<Integer> list = request.getNumbers();
        if (list == null || list.isEmpty()) {
            list = Arrays.asList(95, 45, 82, 100, 30, 76, 25, 92, 88, 94, 58, 91);
        }
        boolean asc = request.getAscending() != null ? request.getAscending() : true;
        CustomMergeSort.MergeSortResult<Integer> result = CustomMergeSort.sortWithTrace(list, asc);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/dijkstra")
    public ResponseEntity<Dijkstra.PathResult> runDijkstraDemo(@RequestBody ShortestPathRequestDTO request) {
        String from = request.getStartLocationCode() != null ? request.getStartLocationCode() : "DEPOT-01";
        String to = request.getEndLocationCode() != null ? request.getEndLocationCode() : "INT-06";
        Dijkstra.PathResult result = routeService.computeShortestPath(from, to);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/heap")
    public ResponseEntity<Map<String, Object>> getHeapDemo() {
        return ResponseEntity.ok(priorityService.getHeapTreeRepresentation());
    }

    @GetMapping("/algorithms-info")
    public ResponseEntity<List<Map<String, Object>>> getAlgorithmsInfo() {
        List<Map<String, Object>> infoList = new ArrayList<>();

        infoList.add(Map.of(
                "id", "max-heap",
                "name", "Custom Max Heap / Priority Queue",
                "type", "Data Structure",
                "timeComplexity", "Insert: O(log N) | Extract-Max: O(log N) | Peek: O(1) | Heapify: O(N)",
                "spaceComplexity", "O(N)",
                "applicationRole", "Dynamic collection prioritization. Whenever a dustbin fill percentage crosses threshold (75% or 90%), it is prioritized with tie-breaking rules.",
                "features", List.of("Array-based binary heap", "Zero reliance on external libraries", "Dynamic expansion", "Tie-breaker logic")
        ));

        infoList.add(Map.of(
                "id", "dijkstra",
                "name", "Dijkstra's Shortest Path Algorithm",
                "type", "Graph Algorithm",
                "timeComplexity", "O((V + E) log V) with Priority Queue Min-Heap",
                "spaceComplexity", "O(V) for distances and predecessor tables",
                "applicationRole", "Calculates exact road distance and path vertex sequence between any two city intersections or collection points.",
                "features", List.of("Min-Heap priority queue relaxation", "Optimal point-to-point shortest road routing", "Full step-by-step trace generation")
        ));

        infoList.add(Map.of(
                "id", "greedy-optimizer",
                "name", "Priority-Aware Greedy Route Optimizer",
                "type", "Optimization Heuristic",
                "timeComplexity", "O(K * (V + E) log V) where K is collection stop count",
                "spaceComplexity", "O(V + E)",
                "applicationRole", "Multi-stop vehicle waste tour solver. Balances dustbin priority vs distance using heuristic Score = (PriorityWeight * 100) / (Distance + 0.5), chaining Dijkstra segments.",
                "features", List.of("Vehicle capacity constraint enforcement", "Priority-distance trade-off score", "Return-to-depot tour closure")
        ));

        infoList.add(Map.of(
                "id", "mergesort",
                "name", "Custom Merge Sort",
                "type", "Sorting Algorithm",
                "timeComplexity", "Best: O(N log N) | Average: O(N log N) | Worst: O(N log N)",
                "spaceComplexity", "O(N) auxiliary space",
                "applicationRole", "Stable sorting of dustbins by fill level, collection logs by timestamp, and location clusters without perturbing equal keys.",
                "features", List.of("Divide-and-conquer recursion", "Stable ordering", "Comparison and merge step telemetry")
        ));

        infoList.add(Map.of(
                "id", "graph",
                "name", "Adjacency List Weighted City Graph",
                "type", "Data Structure",
                "timeComplexity", "Add Vertex: O(1) | Add Edge: O(1) | Neighbor Lookup: O(deg(V))",
                "spaceComplexity", "O(V + E)",
                "applicationRole", "Underlying network representation of smart city road infrastructure, depots, transfer stations, and access lanes.",
                "features", List.of("LinkedHashMap for O(1) vertex resolution", "Bi-directional and one-way road support", "Real-world Pune geospatial coordinates")
        ));

        return ResponseEntity.ok(infoList);
    }
}

