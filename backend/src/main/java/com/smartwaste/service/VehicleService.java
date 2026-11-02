package com.smartwaste.service;

import com.smartwaste.entity.Vehicle;
import com.smartwaste.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }

    @Transactional
    public Vehicle createVehicle(Vehicle vehicle) {
        if (vehicleRepository.findByVehicleNumber(vehicle.getVehicleNumber()).isPresent()) {
            throw new IllegalArgumentException("Vehicle number " + vehicle.getVehicleNumber() + " already exists.");
        }
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicle(Long id, Vehicle updated) {
        Vehicle existing = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with id: " + id));

        existing.setVehicleType(updated.getVehicleType());
        existing.setCapacityKg(updated.getCapacityKg());
        existing.setCurrentLocation(updated.getCurrentLocation());
        existing.setLatitude(updated.getLatitude());
        existing.setLongitude(updated.getLongitude());
        existing.setDriverName(updated.getDriverName());
        existing.setStatus(updated.getStatus());
        existing.setCurrentAssignedRoute(updated.getCurrentAssignedRoute());
        existing.setCollectedWasteCapacity(updated.getCollectedWasteCapacity());

        return vehicleRepository.save(existing);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }

    @Transactional
    public Vehicle updateStatus(Long id, Vehicle.Status status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with id: " + id));
        vehicle.setStatus(status);
        return vehicleRepository.save(vehicle);
    }
}
