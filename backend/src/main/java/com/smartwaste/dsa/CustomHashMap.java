package com.smartwaste.dsa;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * =====================================================================
 * DATA STRUCTURE: CUSTOM HASH MAP (SEPARATE CHAINING)
 * =====================================================================
 * Key-Value dictionary using hash buckets and singly-linked list collision
 * resolution (separate chaining).
 * 
 * TIME COMPLEXITY:
 * - Put:        Average O(1), Worst O(N) in severe hash collisions
 * - Get:        Average O(1), Worst O(N)
 * - Remove:     Average O(1), Worst O(N)
 * - Contains:   Average O(1), Worst O(N)
 * 
 * SPACE COMPLEXITY:
 * - O(N + M) where N is elements and M is bucket array size.
 * =====================================================================
 */
public class CustomHashMap<K, V> implements Serializable {

    public static class Entry<K, V> implements Serializable {
        final K key;
        V value;
        Entry<K, V> next;

        Entry(K key, V value, Entry<K, V> next) {
            this.key = key;
            this.value = value;
            this.next = next;
        }

        public K getKey() { return key; }
        public V getValue() { return value; }
    }

    private Entry<K, V>[] table;
    private int size;
    private int capacity;
    private static final float LOAD_FACTOR = 0.75f;
    private static final int DEFAULT_CAPACITY = 16;

    @SuppressWarnings("unchecked")
    public CustomHashMap() {
        this.capacity = DEFAULT_CAPACITY;
        this.table = new Entry[capacity];
        this.size = 0;
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    private int hash(K key) {
        if (key == null) return 0;
        int h = key.hashCode();
        return (h ^ (h >>> 16)) & (capacity - 1);
    }

    public V put(K key, V value) {
        if ((float) size / capacity >= LOAD_FACTOR) {
            resize();
        }
        int bucketIndex = hash(key);
        Entry<K, V> head = table[bucketIndex];

        while (head != null) {
            if (Objects.equals(head.key, key)) {
                V oldVal = head.value;
                head.value = value;
                return oldVal;
            }
            head = head.next;
        }

        Entry<K, V> newEntry = new Entry<>(key, value, table[bucketIndex]);
        table[bucketIndex] = newEntry;
        size++;
        return null;
    }

    public V get(K key) {
        int bucketIndex = hash(key);
        Entry<K, V> head = table[bucketIndex];
        while (head != null) {
            if (Objects.equals(head.key, key)) {
                return head.value;
            }
            head = head.next;
        }
        return null;
    }

    public boolean containsKey(K key) {
        return get(key) != null;
    }

    public V remove(K key) {
        int bucketIndex = hash(key);
        Entry<K, V> head = table[bucketIndex];
        Entry<K, V> prev = null;

        while (head != null) {
            if (Objects.equals(head.key, key)) {
                if (prev != null) {
                    prev.next = head.next;
                } else {
                    table[bucketIndex] = head.next;
                }
                size--;
                return head.value;
            }
            prev = head;
            head = head.next;
        }
        return null;
    }

    public List<K> keyList() {
        List<K> keys = new ArrayList<>(size);
        for (int i = 0; i < capacity; i++) {
            Entry<K, V> curr = table[i];
            while (curr != null) {
                keys.add(curr.key);
                curr = curr.next;
            }
        }
        return keys;
    }

    public List<V> valueList() {
        List<V> values = new ArrayList<>(size);
        for (int i = 0; i < capacity; i++) {
            Entry<K, V> curr = table[i];
            while (curr != null) {
                values.add(curr.value);
                curr = curr.next;
            }
        }
        return values;
    }

    @SuppressWarnings("unchecked")
    private void resize() {
        int newCapacity = capacity * 2;
        Entry<K, V>[] newTable = new Entry[newCapacity];
        int oldCapacity = capacity;
        this.capacity = newCapacity;

        for (int i = 0; i < oldCapacity; i++) {
            Entry<K, V> head = table[i];
            while (head != null) {
                Entry<K, V> next = head.next;
                int newIndex = hash(head.key);
                head.next = newTable[newIndex];
                newTable[newIndex] = head;
                head = next;
            }
        }
        this.table = newTable;
    }
}

