package net.alephdev.calendar.service;

import net.alephdev.calendar.dto.SprintDto;
import net.alephdev.calendar.dto.functional.SprintTeamDto;
import net.alephdev.calendar.dto.functional.UserStoryPointsDto;
import net.alephdev.calendar.models.Release;
import net.alephdev.calendar.models.Sprint;
import net.alephdev.calendar.models.Team;
import net.alephdev.calendar.repository.ReleaseRepository;
import net.alephdev.calendar.repository.functional.SprintRepository;

import net.alephdev.calendar.repository.functional.TeamRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.sql.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final TeamRepository teamRepository;
    private final ReleaseRepository releaseRepository;

    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    public Sprint createSprint(SprintDto sprintDto) {
        Sprint sprint = new Sprint();
        Team team = teamRepository.findById(sprintDto.getTeamId())
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        sprint.setMajorVersion(sprintDto.getMajorVersion());
        sprint.setStartDate(sprintDto.getStartDate());
        sprint.setEndDate(sprintDto.getEndDate());
        sprint.setRegressionStart(sprintDto.getRegressionStart());
        sprint.setRegressionEnd(sprintDto.getRegressionEnd());
        sprint.setTeam(team);

        return sprintRepository.save(sprint);
    }

    public Sprint updateSprint(Integer id, SprintDto updatedSprint) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));

        sprint.setMajorVersion(updatedSprint.getMajorVersion());
        sprint.setStartDate(updatedSprint.getStartDate());
        sprint.setEndDate(updatedSprint.getEndDate());
        sprint.setRegressionStart(updatedSprint.getRegressionStart());
        sprint.setRegressionEnd(updatedSprint.getRegressionEnd());

        if(updatedSprint.getTeamId() != null) {
            Team team = teamRepository.findById(updatedSprint.getTeamId())
                    .orElseThrow(() -> new IllegalArgumentException("Team not found"));
            sprint.setTeam(team);
        }

        return sprintRepository.save(sprint);
    }

    public void deleteSprint(Integer id) {
        sprintRepository.deleteById(id);
    }

    public List<Release> getSprintReleases(Integer sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found with ID: " + sprintId));
        return releaseRepository.findAllBySprint(sprint);
    }

    public List<SprintTeamDto> getSprintsByYearAndTeam(Integer year, String teamName) {
        List<Object[]> results = sprintRepository.getSprintsByYearAndTeam(year, teamName);
        
        return results.stream()
            .map(row -> new SprintTeamDto(
                ((Number) row[0]).intValue(),  // sprint_id
                (String) row[1],               // major_version
                ((Date) row[2]).toLocalDate(), // start_date
                ((Date) row[3]).toLocalDate(), // end_date
                (String) row[4]                // team_name
            ))
            .collect(Collectors.toList());
    }

    public List<UserStoryPointsDto> getStoryPointsPerUser(Integer sprintId) {
    return sprintRepository.getStoryPointsPerUser(sprintId)
        .stream()
            .map(row -> new UserStoryPointsDto(
                (String) row[0],                // user_login
                ((Number) row[1]).longValue()  // total_story_points
            ))
            .collect(Collectors.toList());
    }
}
