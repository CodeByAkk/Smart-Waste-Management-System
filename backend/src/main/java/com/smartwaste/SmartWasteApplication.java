package com.smartwaste;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartWasteApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartWasteApplication.class, args);
        System.out.println("==========================================================");
        System.out.println(" SMART WASTE MANAGEMENT SYSTEM (SPRING BOOT + CORE DSA)   ");
        System.out.println(" System Started Successfully on http://localhost:8080    ");
        System.out.println(" H2 Console available at: http://localhost:8080/h2-console");
        System.out.println("==========================================================");
    }
}
