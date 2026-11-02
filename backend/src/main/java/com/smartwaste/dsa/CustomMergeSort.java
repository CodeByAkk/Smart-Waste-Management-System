package com.smartwaste.dsa;

import java.io.Serializable;
import java.util.*;

/**
 * =====================================================================
 * ALGORITHM: CUSTOM MERGE SORT
 * =====================================================================
 * Divide-and-Conquer sorting algorithm with stable O(N log N) performance.
 * Used for sorting dustbin collections, historical records, and locations.
 * 
 * TIME COMPLEXITY:
 * - Best Case:    O(N log N)
 * - Average Case: O(N log N)
 * - Worst Case:   O(N log N)
 * 
 * SPACE COMPLEXITY:
 * - O(N) auxiliary space for temporary merge buffers.
 * 
 * STABILITY:
 * - Highly stable: equal elements preserve their relative initial order.
 * =====================================================================
 */
public class CustomMergeSort {

    public static class SortStepTrace implements Serializable {
        private int stepNumber;
        private String action; // "DIVIDE", "MERGE"
        private int leftIndex;
        private int midIndex;
        private int rightIndex;
        private List<Integer> currentSubarray;
        private String explanation;

        public SortStepTrace(int stepNumber, String action, int leftIndex, int midIndex,
                             int rightIndex, List<Integer> currentSubarray, String explanation) {
            this.stepNumber = stepNumber;
            this.action = action;
            this.leftIndex = leftIndex;
            this.midIndex = midIndex;
            this.rightIndex = rightIndex;
            this.currentSubarray = currentSubarray;
            this.explanation = explanation;
        }

        public int getStepNumber() { return stepNumber; }
        public String getAction() { return action; }
        public int getLeftIndex() { return leftIndex; }
        public int getMidIndex() { return midIndex; }
        public int getRightIndex() { return rightIndex; }
        public List<Integer> getCurrentSubarray() { return currentSubarray; }
        public String getExplanation() { return explanation; }
    }

    public static class MergeSortResult<T> implements Serializable {
        private List<T> sortedList;
        private int comparisonsCount;
        private int mergesCount;
        private List<SortStepTrace> stepTraces;
        private long executionTimeNanos;

        public MergeSortResult(List<T> sortedList, int comparisonsCount, int mergesCount,
                               List<SortStepTrace> stepTraces, long executionTimeNanos) {
            this.sortedList = sortedList;
            this.comparisonsCount = comparisonsCount;
            this.mergesCount = mergesCount;
            this.stepTraces = stepTraces;
            this.executionTimeNanos = executionTimeNanos;
        }

        public List<T> getSortedList() { return sortedList; }
        public int getComparisonsCount() { return comparisonsCount; }
        public int getMergesCount() { return mergesCount; }
        public List<SortStepTrace> getStepTraces() { return stepTraces; }
        public long getExecutionTimeNanos() { return executionTimeNanos; }
    }

    /**
     * Generic Merge Sort with custom Comparator.
     */
    public static <T> void sort(List<T> list, Comparator<T> comparator) {
        if (list == null || list.size() <= 1) return;
        List<T> aux = new ArrayList<>(list);
        mergeSort(list, aux, 0, list.size() - 1, comparator);
    }

    private static <T> void mergeSort(List<T> list, List<T> aux, int low, int high, Comparator<T> comparator) {
        if (high <= low) return;
        int mid = low + (high - low) / 2;
        mergeSort(list, aux, low, mid, comparator);
        mergeSort(list, aux, mid + 1, high, comparator);
        merge(list, aux, low, mid, high, comparator);
    }

    private static <T> void merge(List<T> list, List<T> aux, int low, int mid, int high, Comparator<T> comparator) {
        for (int k = low; k <= high; k++) {
            aux.set(k, list.get(k));
        }

        int i = low;
        int j = mid + 1;
        for (int k = low; k <= high; k++) {
            if (i > mid) {
                list.set(k, aux.get(j++));
            } else if (j > high) {
                list.set(k, aux.get(i++));
            } else if (comparator.compare(aux.get(j), aux.get(i)) < 0) {
                list.set(k, aux.get(j++));
            } else {
                list.set(k, aux.get(i++));
            }
        }
    }

    /**
     * Interactive Merge Sort Tracer for Integer arrays in the DSA demonstration sandbox.
     */
    public static MergeSortResult<Integer> sortWithTrace(List<Integer> inputList, boolean ascending) {
        long startTime = System.nanoTime();
        List<Integer> list = new ArrayList<>(inputList);
        List<SortStepTrace> traces = new ArrayList<>();
        int[] counters = new int[3]; // [0: comparisons, 1: merges, 2: stepCounter]
        counters[2] = 1;

        if (list.size() > 1) {
            List<Integer> aux = new ArrayList<>(list);
            traceMergeSort(list, aux, 0, list.size() - 1, ascending, traces, counters);
        }

        long elapsedNanos = System.nanoTime() - startTime;
        return new MergeSortResult<>(list, counters[0], counters[1], traces, elapsedNanos);
    }

    private static void traceMergeSort(List<Integer> list, List<Integer> aux, int low, int high,
                                       boolean ascending, List<SortStepTrace> traces, int[] counters) {
        if (high <= low) return;
        int mid = low + (high - low) / 2;

        traces.add(new SortStepTrace(
                counters[2]++,
                "DIVIDE",
                low, mid, high,
                new ArrayList<>(list.subList(low, high + 1)),
                "Subdividing segment [" + low + ".." + high + "] into left [" + low + ".." + mid + "] and right [" + (mid + 1) + ".." + high + "]"
        ));

        traceMergeSort(list, aux, low, mid, ascending, traces, counters);
        traceMergeSort(list, aux, mid + 1, high, ascending, traces, counters);

        traceMerge(list, aux, low, mid, high, ascending, traces, counters);
    }

    private static void traceMerge(List<Integer> list, List<Integer> aux, int low, int mid, int high,
                                   boolean ascending, List<SortStepTrace> traces, int[] counters) {
        for (int k = low; k <= high; k++) {
            aux.set(k, list.get(k));
        }

        int i = low;
        int j = mid + 1;
        for (int k = low; k <= high; k++) {
            if (i > mid) {
                list.set(k, aux.get(j++));
            } else if (j > high) {
                list.set(k, aux.get(i++));
            } else {
                counters[0]++; // Comparison
                boolean condition = ascending ? (aux.get(j) < aux.get(i)) : (aux.get(j) > aux.get(i));
                if (condition) {
                    list.set(k, aux.get(j++));
                } else {
                    list.set(k, aux.get(i++));
                }
            }
        }
        counters[1]++; // Merge step

        traces.add(new SortStepTrace(
                counters[2]++,
                "MERGE",
                low, mid, high,
                new ArrayList<>(list.subList(low, high + 1)),
                "Merged sorted left [" + low + ".." + mid + "] and right [" + (mid + 1) + ".." + high + "] into combined sorted segment"
        ));
    }
}

