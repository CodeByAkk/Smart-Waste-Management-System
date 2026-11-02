package com.smartwaste.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class NotificationService {

    public static class SystemAlert {
        private String id;
        private String type; // "CRITICAL_FILL", "HIGH_FILL", "COMPLAINT", "COLLECTION", "VEHICLE"
        private String title;
        private String message;
        private String severity; // "danger", "warning", "info", "success"
        private LocalDateTime timestamp;
        private boolean read = false;

        public SystemAlert(String type, String title, String message, String severity) {
            this.id = UUID.randomUUID().toString();
            this.type = type;
            this.title = title;
            this.message = message;
            this.severity = severity;
            this.timestamp = LocalDateTime.now();
        }

        public String getId() { return id; }
        public String getType() { return type; }
        public String getTitle() { return title; }
        public String getMessage() { return message; }
        public String getSeverity() { return severity; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public boolean isRead() { return read; }
        public void setRead(boolean read) { this.read = read; }
    }

    private final Deque<SystemAlert> alerts = new ConcurrentLinkedDeque<>();
    private static final int MAX_ALERTS = 50;

    public void addAlert(String type, String title, String message, String severity) {
        alerts.addFirst(new SystemAlert(type, title, message, severity));
        while (alerts.size() > MAX_ALERTS) {
            alerts.removeLast();
        }
    }

    public List<SystemAlert> getAllAlerts() {
        return new ArrayList<>(alerts);
    }

    public void markAllAsRead() {
        for (SystemAlert alert : alerts) {
            alert.setRead(true);
        }
    }

    public long getUnreadCount() {
        return alerts.stream().filter(a -> !a.isRead()).count();
    }
}

