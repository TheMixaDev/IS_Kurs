package net.alephdev.calendar.repository.functional;

import net.alephdev.calendar.dto.functional.TopRiskProjection;
import net.alephdev.calendar.models.Risk;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RiskRepository extends JpaRepository<Risk, Integer> {
    @Query(value = "SELECT * FROM get_top_10_task_risks()", nativeQuery = true)
    List<TopRiskProjection> getTop10TaskRisks();
}
