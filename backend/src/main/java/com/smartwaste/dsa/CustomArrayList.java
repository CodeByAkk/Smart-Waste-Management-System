package com.smartwaste.dsa;

import java.io.Serializable;
import java.util.Arrays;
import java.util.Iterator;
import java.util.NoSuchElementException;

/**
 * =====================================================================
 * DATA STRUCTURE: CUSTOM DYNAMIC ARRAY (ARRAYLIST)
 * =====================================================================
 * Foundational sequential storage with automatic 1.5x/2x resizing.
 * 
 * TIME COMPLEXITY:
 * - Access by Index:   O(1)
 * - Append (Add):      Amortized O(1), Worst-case O(N) during resize
 * - Insert at Index:   O(N) due to element shifting
 * - Remove:            O(N)
 * 
 * SPACE COMPLEXITY:
 * - O(N)
 * =====================================================================
 */
public class CustomArrayList<E> implements Iterable<E>, Serializable {

    private Object[] elements;
    private int size;
    private static final int INITIAL_CAPACITY = 10;

    public CustomArrayList() {
        this(INITIAL_CAPACITY);
    }

    public CustomArrayList(int initialCapacity) {
        if (initialCapacity < 0) throw new IllegalArgumentException("Illegal Capacity: " + initialCapacity);
        this.elements = new Object[Math.max(initialCapacity, 4)];
        this.size = 0;
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public void add(E element) {
        ensureCapacity(size + 1);
        elements[size++] = element;
    }

    @SuppressWarnings("unchecked")
    public E get(int index) {
        checkIndex(index);
        return (E) elements[index];
    }

    @SuppressWarnings("unchecked")
    public E set(int index, E element) {
        checkIndex(index);
        E old = (E) elements[index];
        elements[index] = element;
        return old;
    }

    @SuppressWarnings("unchecked")
    public E remove(int index) {
        checkIndex(index);
        E oldValue = (E) elements[index];
        int numMoved = size - index - 1;
        if (numMoved > 0) {
            System.arraycopy(elements, index + 1, elements, index, numMoved);
        }
        elements[--size] = null;
        return oldValue;
    }

    public void clear() {
        Arrays.fill(elements, 0, size, null);
        size = 0;
    }

    private void ensureCapacity(int minCapacity) {
        if (minCapacity > elements.length) {
            int newCapacity = elements.length + (elements.length >> 1); // 1.5x growth
            if (newCapacity < minCapacity) newCapacity = minCapacity;
            elements = Arrays.copyOf(elements, newCapacity);
        }
    }

    private void checkIndex(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
        }
    }

    @Override
    public Iterator<E> iterator() {
        return new Iterator<E>() {
            private int cursor = 0;

            @Override
            public boolean hasNext() {
                return cursor < size;
            }

            @Override
            @SuppressWarnings("unchecked")
            public E next() {
                if (cursor >= size) throw new NoSuchElementException();
                return (E) elements[cursor++];
            }
        };
    }
}
