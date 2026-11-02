package com.smartwaste.controller;

import com.smartwaste.dto.SensorUpdateDTO;
import com.smartwaste.entity.Dustbin;
import com.smartwaste.service.DustbinService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dustbins")
@CrossOrigin(origins = "*")
public class DustbinController {

    private final DustbinService dustbinService;

    public DustbinController(DustbinService dustbinService) {
        this.dustbinService = dustbinService;
    }

    @GetMapping
    public ResponseEntity<List<Dustbin>> getAllDustbins() {
        return ResponseEntity.ok(dustbinService.getAllDustbins());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dustbin> getDustbinById(@PathVariable Long id) {
        return dustbinService.getDustbinById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Dustbin> createDustbin(@RequestBody Dustbin dustbin) {
        return ResponseEntity.ok(dustbinService.createDustbin(dustbin));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dustbin> updateDustbin(@PathVariable Long id, @RequestBody Dustbin dustbin) {
        return ResponseEntity.ok(dustbinService.updateDustbin(id, dustbin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDustbin(@PathVariable Long id) {
        dustbinService.deleteDustbin(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/simulate-sensor")
    public ResponseEntity<Dustbin> simulateSensorUpdate(@RequestBody SensorUpdateDTO updateDTO) {
        Dustbin updated = dustbinService.updateSensorFill(
                updateDTO.getDustbinCode(),
                updateDTO.getFillPercentage(),
                updateDTO.getIsSimulated() != null ? updateDTO.getIsSimulated() : true
        );
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/simulate-random")
    public ResponseEntity<List<Dustbin>> simulateRandomSensorUpdates() {
        List<Dustbin> updated = dustbinService.simulateRandomSensorUpdates();
        return ResponseEntity.ok(updated);
    }
}

