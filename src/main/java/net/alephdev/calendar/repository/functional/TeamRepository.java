package net.alephdev.calendar.repository.functional;

import net.alephdev.calendar.models.Team;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends JpaRepository<Team, Integer> {
    @Query(value = "SELECT calculate_team_load(:teamId, :sprintId)", nativeQuery = true)
    BigDecimal calculateTeamLoad(@Param("teamId") Integer teamId, @Param("sprintId") Integer sprintId);

    List<Team> findAllByIsActive(boolean b, Sort sort);

    Optional<Team> findByName(String name);
}
