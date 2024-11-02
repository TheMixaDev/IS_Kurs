package net.alephdev.calendar.service;

import net.alephdev.calendar.dto.funcDto.SprintTeamDto;
import net.alephdev.calendar.dto.funcDto.UserStoryPointsDto;
import net.alephdev.calendar.models.Sprint;
import net.alephdev.calendar.repository.repoWithFunc.SprintRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;

    @Autowired
    public SprintService(SprintRepository sprintRepository) {
        this.sprintRepository = sprintRepository;
    }

    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    public Sprint createSprint(Sprint sprint) {
        return sprintRepository.save(sprint);
    }

    public Sprint updateSprint(Integer id, Sprint updatedSprint) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));

        sprint.setMajorVersion(updatedSprint.getMajorVersion());
        sprint.setStartDate(updatedSprint.getStartDate());
        sprint.setEndDate(updatedSprint.getEndDate());
        sprint.setRegressionStart(updatedSprint.getRegressionStart());
        sprint.setRegressionEnd(updatedSprint.getRegressionEnd());
        sprint.setTeam(updatedSprint.getTeam());

        return sprintRepository.save(sprint);
    }

    public void deleteSprint(Integer id) {
        sprintRepository.deleteById(id);
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
