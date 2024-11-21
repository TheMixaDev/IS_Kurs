package net.alephdev.calendar.repository.functional;

import net.alephdev.calendar.dto.functional.TopRiskProjection;
import net.alephdev.calendar.models.Risk;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RiskRepository extends JpaRepository<Risk, Integer> {
    @Query(value = "SELECT * FROM get_top_10_task_risks()", nativeQuery = true)
    List<TopRiskProjection> getTop10TaskRisks();
    
    Page<Risk> findByDescriptionContainingIgnoreCase(String description, Pageable pageable);

    Optional<Risk> findByDescription(String description);
}
