package com.smartwaste.service;

import com.smartwaste.dsa.CustomMaxHeap;
import com.smartwaste.entity.Dustbin;
import com.smartwaste.repository.DustbinRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PriorityService {

    private final DustbinRepository dustbinRepository;
    private final CustomMaxHeap maxHeap;

    public PriorityService(DustbinRepository dustbinRepository) {
        this.dustbinRepository = dustbinRepository;
        this.maxHeap = new CustomMaxHeap(64);
    }

    @PostConstruct
    public void init() {
        rebuildHeap();
    }

    public synchronized void rebuildHeap() {
        List<Dustbin> bins = dustbinRepository.findAll();
        List<CustomMaxHeap.HeapNode> nodes = new ArrayList<>(bins.size());
        for (Dustbin b : bins) {
            // Only insert bins that are not completely empty into active priority queue
            nodes.add(new CustomMaxHeap.HeapNode(
                    b.getId() != null ? b.getId().toString() : "",
                    b.getDustbinCode(),
                    b.getLocationName(),
                    b.getFillPercentage(),
                    b.getLatitude(),
                    b.getLongitude(),
                    b.getUpdatedAt() != null ? b.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : System.currentTimeMillis()
            ));
        }
        maxHeap.rebuild(nodes);
    }

    public synchronized void updatePriority(Dustbin dustbin) {
        if (dustbin == null || dustbin.getDustbinCode() == null) return;
        boolean updated = maxHeap.updatePriority(dustbin.getDustbinCode(), dustbin.getFillPercentage());
        if (!updated) {
            maxHeap.insert(new CustomMaxHeap.HeapNode(
                    dustbin.getId() != null ? dustbin.getId().toString() : "",
                    dustbin.getDustbinCode(),
                    dustbin.getLocationName(),
                    dustbin.getFillPercentage(),
                    dustbin.getLatitude(),
                    dustbin.getLongitude(),
                    System.currentTimeMillis()
            ));
        }
    }

    public synchronized void remove(String dustbinCode) {
        maxHeap.remove(dustbinCode);
    }

    public synchronized CustomMaxHeap.HeapNode peekTop() {
        return maxHeap.peek();
    }

    public synchronized CustomMaxHeap.HeapNode extractTop() {
        return maxHeap.extractMax();
    }

    public synchronized List<CustomMaxHeap.HeapNode> getHeapArray() {
        return maxHeap.getHeapArray();
    }

    public synchronized List<CustomMaxHeap.HeapNode> getSortedPriorityQueue() {
        return maxHeap.getSortedPriorities();
    }

    public synchronized Map<String, Object> getHeapTreeRepresentation() {
        List<CustomMaxHeap.HeapNode> array = maxHeap.getHeapArray();
        Map<String, Object> response = new HashMap<>();
        response.put("size", maxHeap.size());
        response.put("heapArray", array);
        response.put("top", maxHeap.peek());

        // Build tree links for visualizer: [ { parent: i, leftChild: 2*i+1, rightChild: 2*i+2 } ]
        List<Map<String, Object>> treeNodes = new ArrayList<>();
        for (int i = 0; i < array.size(); i++) {
            Map<String, Object> nodeMap = new HashMap<>();
            nodeMap.put("index", i);
            nodeMap.put("node", array.get(i));
            int left = 2 * i + 1;
            int right = 2 * i + 2;
            nodeMap.put("leftIndex", left < array.size() ? left : null);
            nodeMap.put("rightIndex", right < array.size() ? right : null);
            int parent = (i - 1) / 2;
            nodeMap.put("parentIndex", i == 0 ? null : parent);
            treeNodes.add(nodeMap);
        }
        response.put("treeNodes", treeNodes);
        return response;
    }
}
