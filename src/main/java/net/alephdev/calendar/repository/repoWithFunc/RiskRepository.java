package net.alephdev.calendar.repository.repoWithFunc;

import net.alephdev.calendar.models.Risk;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RiskRepository extends JpaRepository<Risk, Integer> {
    @Query(value = "SELECT * FROM get_top_10_task_risks()", nativeQuery = true)
    List<Object[]> getTop10TaskRisks();
}
