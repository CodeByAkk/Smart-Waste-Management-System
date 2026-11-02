package com.smartwaste.dsa;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * =====================================================================
 * DATA STRUCTURE: CUSTOM MAX HEAP (PRIORITY QUEUE)
 * =====================================================================
 * Core DSA implementation for Smart Waste Priority Management.
 * 
 * TIME COMPLEXITY:
 * - Insert (Push):       O(log N)
 * - Extract Max (Pop):   O(log N)
 * - Peek (Get Max):      O(1)
 * - Update Priority:     O(N) search + O(log N) reheapify = O(N)
 * - Heapify / Build Heap:O(N)
 * 
 * SPACE COMPLEXITY:
 * - O(N) where N is the number of dustbins in the priority queue.
 * 
 * TIE-BREAKING RULE:
 * When two dustbins have the identical fill percentage, the tie-breaker
 * evaluates the timestamp (earlier report has higher priority) or
 * distance to depot.
 * =====================================================================
 */
public class CustomMaxHeap implements Serializable {

    public static class HeapNode implements Serializable, Comparable<HeapNode> {
        private String id;
        private String dustbinCode;
        private String locationName;
        private int fillPercentage;
        private double priorityScore; // Derived score: fillPercentage * 1.0 + tieBreaker
        private String priorityLevel; // CRITICAL, HIGH, MEDIUM, LOW
        private double latitude;
        private double longitude;
        private long registeredTimestamp;

        public HeapNode() {}

        public HeapNode(String id, String dustbinCode, String locationName, int fillPercentage,
                        double latitude, double longitude, long registeredTimestamp) {
            this.id = id;
            this.dustbinCode = dustbinCode;
            this.locationName = locationName;
            this.fillPercentage = fillPercentage;
            this.latitude = latitude;
            this.longitude = longitude;
            this.registeredTimestamp = registeredTimestamp;
            this.priorityLevel = calculatePriorityLevel(fillPercentage);
            this.priorityScore = calculateScore(fillPercentage, registeredTimestamp);
        }

        public static String calculatePriorityLevel(int fill) {
            if (fill >= 90) return "CRITICAL";
            if (fill >= 75) return "HIGH";
            if (fill >= 50) return "MEDIUM";
            return "LOW";
        }

        private static double calculateScore(int fill, long timestamp) {
            // Base priority is fill percentage (0-100).
            // Tie-breaker: slight fraction based on age (earlier timestamp -> higher fraction)
            double ageFactor = (System.currentTimeMillis() - timestamp) / 100000000.0;
            if (ageFactor > 0.99) ageFactor = 0.99;
            return fill + (ageFactor * 0.1);
        }

        @Override
        public int compareTo(HeapNode other) {
            if (other == null) return 1;
            int diff = Double.compare(this.priorityScore, other.priorityScore);
            if (diff != 0) return diff;
            // Strict tie breaker: compare dustbin codes lexicographically
            return this.dustbinCode.compareTo(other.dustbinCode);
        }

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDustbinCode() { return dustbinCode; }
        public void setDustbinCode(String dustbinCode) { this.dustbinCode = dustbinCode; }
        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }
        public int getFillPercentage() { return fillPercentage; }
        public void setFillPercentage(int fillPercentage) { 
            this.fillPercentage = fillPercentage; 
            this.priorityLevel = calculatePriorityLevel(fillPercentage);
            this.priorityScore = calculateScore(fillPercentage, this.registeredTimestamp);
        }
        public double getPriorityScore() { return priorityScore; }
        public String getPriorityLevel() { return priorityLevel; }
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
        public long getRegisteredTimestamp() { return registeredTimestamp; }
    }

    private HeapNode[] heap;
    private int size;
    private int capacity;
    private static final int DEFAULT_CAPACITY = 32;

    public CustomMaxHeap() {
        this(DEFAULT_CAPACITY);
    }

    public CustomMaxHeap(int initialCapacity) {
        this.capacity = Math.max(initialCapacity, 8);
        this.heap = new HeapNode[this.capacity];
        this.size = 0;
    }

    public synchronized int size() {
        return size;
    }

    public synchronized boolean isEmpty() {
        return size == 0;
    }

    /**
     * Insert a new dustbin node into the max heap.
     * Time Complexity: O(log N)
     */
    public synchronized void insert(HeapNode node) {
        if (node == null) return;
        ensureCapacity();
        heap[size] = node;
        heapifyUp(size);
        size++;
    }

    /**
     * Peek at the highest priority dustbin without removing it.
     * Time Complexity: O(1)
     */
    public synchronized HeapNode peek() {
        if (isEmpty()) return null;
        return heap[0];
    }

    /**
     * Extract and return the highest priority dustbin.
     * Time Complexity: O(log N)
     */
    public synchronized HeapNode extractMax() {
        if (isEmpty()) return null;
        HeapNode root = heap[0];
        heap[0] = heap[size - 1];
        heap[size - 1] = null;
        size--;
        if (size > 0) {
            heapifyDown(0);
        }
        return root;
    }

    /**
     * Update the fill percentage and priority of an existing dustbin in the heap.
     * If not present, optionally inserts it.
     * Time Complexity: O(N) search + O(log N) reheapify
     */
    public synchronized boolean updatePriority(String dustbinCode, int newFillPercentage) {
        for (int i = 0; i < size; i++) {
            if (heap[i].getDustbinCode().equalsIgnoreCase(dustbinCode)) {
                int oldFill = heap[i].getFillPercentage();
                heap[i].setFillPercentage(newFillPercentage);
                if (newFillPercentage > oldFill) {
                    heapifyUp(i);
                } else {
                    heapifyDown(i);
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Remove a dustbin by code from the heap.
     */
    public synchronized boolean remove(String dustbinCode) {
        for (int i = 0; i < size; i++) {
            if (heap[i].getDustbinCode().equalsIgnoreCase(dustbinCode)) {
                heap[i] = heap[size - 1];
                heap[size - 1] = null;
                size--;
                if (i < size) {
                    heapifyUp(i);
                    heapifyDown(i);
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Clear all elements in the heap.
     */
    public synchronized void clear() {
        Arrays.fill(heap, 0, size, null);
        this.size = 0;
    }

    /**
     * Rebuild entire heap from a list of nodes (Bottom-up heap construction).
     * Time Complexity: O(N)
     */
    public synchronized void rebuild(List<HeapNode> nodes) {
        clear();
        if (nodes == null || nodes.isEmpty()) return;
        while (this.capacity < nodes.size()) {
            this.capacity *= 2;
        }
        this.heap = new HeapNode[this.capacity];
        for (HeapNode n : nodes) {
            this.heap[size++] = n;
        }
        // Bottom-up heapify: start from last non-leaf parent (size / 2 - 1) down to 0
        for (int i = (size / 2) - 1; i >= 0; i--) {
            heapifyDown(i);
        }
    }

    /**
     * Return a snapshot list of current heap elements in array order.
     */
    public synchronized List<HeapNode> getHeapArray() {
        List<HeapNode> list = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            list.add(heap[i]);
        }
        return list;
    }

    /**
     * Return elements in sorted order of priority without destroying the main heap.
     */
    public synchronized List<HeapNode> getSortedPriorities() {
        CustomMaxHeap temp = new CustomMaxHeap(size + 1);
        for (int i = 0; i < size; i++) {
            temp.insert(heap[i]);
        }
        List<HeapNode> sorted = new ArrayList<>(size);
        while (!temp.isEmpty()) {
            sorted.add(temp.extractMax());
        }
        return sorted;
    }

    // --- Private Helper Methods ---

    private void heapifyUp(int index) {
        while (index > 0) {
            int parentIndex = (index - 1) / 2;
            if (heap[index].compareTo(heap[parentIndex]) > 0) {
                swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private void heapifyDown(int index) {
        while (index < size) {
            int leftChild = 2 * index + 1;
            int rightChild = 2 * index + 2;
            int largest = index;

            if (leftChild < size && heap[leftChild].compareTo(heap[largest]) > 0) {
                largest = leftChild;
            }
            if (rightChild < size && heap[rightChild].compareTo(heap[largest]) > 0) {
                largest = rightChild;
            }

            if (largest != index) {
                swap(index, largest);
                index = largest;
            } else {
                break;
            }
        }
    }

    private void swap(int i, int j) {
        HeapNode temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
    }

    private void ensureCapacity() {
        if (size >= capacity) {
            capacity = capacity * 2;
            heap = Arrays.copyOf(heap, capacity);
        }
    }
}

