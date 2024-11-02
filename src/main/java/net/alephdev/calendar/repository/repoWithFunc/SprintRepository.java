package net.alephdev.calendar.repository.repoWithFunc;

import net.alephdev.calendar.models.Sprint;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Integer> {
    @Query(value = "SELECT * FROM get_sprints_by_year_and_team(:year, :teamName)", nativeQuery = true)
    List<Object[]> getSprintsByYearAndTeam(@Param("year") Integer year, @Param("teamName") String teamName);

    @Query(value = "SELECT * FROM get_story_points_per_user_in_sprint(:sprintId)", nativeQuery = true)
    List<Object[]> getStoryPointsPerUser(@Param("sprintId") Integer sprintId);
}
