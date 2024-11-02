package net.alephdev.calendar.repository.repoWithFunc;

import net.alephdev.calendar.models.Team;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends JpaRepository<Team, Integer> {
    @Query(value = "SELECT calculate_team_load(:teamId, :sprintId)", nativeQuery = true)
    BigDecimal calculateTeamLoad(@Param("teamId") Integer teamId, @Param("sprintId") Integer sprintId);
}
