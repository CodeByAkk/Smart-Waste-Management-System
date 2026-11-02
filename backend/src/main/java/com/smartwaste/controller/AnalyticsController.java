package com.smartwaste.controller;

import com.smartwaste.dto.DashboardStatsDTO;
import com.smartwaste.service.AnalyticsService;
import com.smartwaste.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final NotificationService notificationService;

    public AnalyticsController(AnalyticsService analyticsService, NotificationService notificationService) {
        this.analyticsService = analyticsService;
        this.notificationService = notificationService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<NotificationService.SystemAlert>> getAlerts() {
        return ResponseEntity.ok(notificationService.getAllAlerts());
    }

    @PostMapping("/alerts/read-all")
    public ResponseEntity<Map<String, String>> markAlertsAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read."));
    }
}

