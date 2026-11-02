package com.smartwaste.dto;

import java.util.List;

public class MergeSortDemoRequestDTO {
    private List<Integer> numbers;
    private Boolean ascending = true;

    public MergeSortDemoRequestDTO() {}

    public List<Integer> getNumbers() { return numbers; }
    public void setNumbers(List<Integer> numbers) { this.numbers = numbers; }
    public Boolean getAscending() { return ascending; }
    public void setAscending(Boolean ascending) { this.ascending = ascending; }
}

