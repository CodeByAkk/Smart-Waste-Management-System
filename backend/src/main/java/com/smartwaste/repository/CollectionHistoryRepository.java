package com.smartwaste.repository;

import com.smartwaste.entity.CollectionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CollectionHistoryRepository extends JpaRepository<CollectionHistory, Long> {
    List<CollectionHistory> findByOrderByCollectionDateDesc();
    List<CollectionHistory> findByDustbinCode(String dustbinCode);
    List<CollectionHistory> findByStaffId(Long staffId);

    @Query("SELECT COUNT(c) FROM CollectionHistory c WHERE c.collectionDate >= :startOfDay")
    long countCollectionsToday(@org.springframework.data.repository.query.Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT SUM(c.collectedWasteQuantity) FROM CollectionHistory c")
    Double sumTotalWasteCollected();
}
