package com.smartwaste.repository;

import com.smartwaste.entity.Dustbin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DustbinRepository extends JpaRepository<Dustbin, Long> {
    Optional<Dustbin> findByDustbinCode(String dustbinCode);
    boolean existsByDustbinCode(String dustbinCode);

    List<Dustbin> findByStatus(Dustbin.Status status);
    List<Dustbin> findByPriorityLevel(Dustbin.PriorityLevel priorityLevel);

    @Query("SELECT d FROM Dustbin d WHERE d.fillPercentage >= :threshold ORDER BY d.fillPercentage DESC")
    List<Dustbin> findHighPriorityBins(@org.springframework.data.repository.query.Param("threshold") int threshold);

    @Query("SELECT COUNT(d) FROM Dustbin d WHERE d.status = :status")
    long countByStatus(@org.springframework.data.repository.query.Param("status") Dustbin.Status status);

    @Query("SELECT COUNT(d) FROM Dustbin d WHERE d.fillPercentage >= 90")
    long countCriticalBins();

    @Query("SELECT COUNT(d) FROM Dustbin d WHERE d.fillPercentage >= 75 AND d.fillPercentage < 90")
    long countAlmostFullBins();

    @Query("SELECT COUNT(d) FROM Dustbin d WHERE d.fillPercentage >= 31 AND d.fillPercentage < 75")
    long countPartiallyFilledBins();

    @Query("SELECT COUNT(d) FROM Dustbin d WHERE d.fillPercentage <= 30")
    long countEmptyBins();
}
