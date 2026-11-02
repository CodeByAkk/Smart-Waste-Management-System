package com.smartwaste.controller;

import com.smartwaste.dsa.CustomMaxHeap;
import com.smartwaste.service.PriorityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/priority")
@CrossOrigin(origins = "*")
public class PriorityController {

    private final PriorityService priorityService;

    public PriorityController(PriorityService priorityService) {
        this.priorityService = priorityService;
    }

    @GetMapping
    public ResponseEntity<List<CustomMaxHeap.HeapNode>> getPriorityQueue() {
        return ResponseEntity.ok(priorityService.getSortedPriorityQueue());
    }

    @GetMapping("/next")
    public ResponseEntity<CustomMaxHeap.HeapNode> getNextDustbin() {
        CustomMaxHeap.HeapNode next = priorityService.peekTop();
        if (next == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(next);
    }

    @GetMapping("/tree")
    public ResponseEntity<Map<String, Object>> getHeapTree() {
        return ResponseEntity.ok(priorityService.getHeapTreeRepresentation());
    }

    @PostMapping("/rebuild")
    public ResponseEntity<Map<String, String>> rebuildPriorityQueue() {
        priorityService.rebuildHeap();
        return ResponseEntity.ok(Map.of("message", "Custom Max Heap rebuilt successfully from database."));
    }

    @PostMapping("/extract-max")
    public ResponseEntity<CustomMaxHeap.HeapNode> extractMax() {
        CustomMaxHeap.HeapNode max = priorityService.extractTop();
        if (max == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(max);
    }
}
