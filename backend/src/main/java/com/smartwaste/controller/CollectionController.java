package com.smartwaste.controller;

import com.smartwaste.dto.CompleteCollectionRequestDTO;
import com.smartwaste.entity.CollectionHistory;
import com.smartwaste.service.CollectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
@CrossOrigin(origins = "*")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping("/history")
    public ResponseEntity<List<CollectionHistory>> getCollectionHistory() {
        return ResponseEntity.ok(collectionService.getAllHistory());
    }

    @PostMapping("/complete")
    public ResponseEntity<CollectionHistory> completeCollection(@RequestBody CompleteCollectionRequestDTO request) {
        return ResponseEntity.ok(collectionService.completeCollection(request));
    }
}

