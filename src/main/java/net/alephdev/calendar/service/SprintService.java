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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.sql.Date;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final TeamRepository teamRepository;
    private final ReleaseRepository releaseRepository;

    public Page<Sprint> getAllSprints(int page) {
        return sprintRepository.findAll(PageRequest.of(page, 20, Sort.by(Sort.Direction.ASC, "endDate")));
    }

    public Sprint createSprint(SprintDto sprintDto) {
        Sprint sprint = new Sprint();
        Team team = teamRepository.findById(sprintDto.getTeamId())
                .orElseThrow(() -> new NoSuchElementException("Team not found"));

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
                .orElseThrow(() -> new NoSuchElementException("Sprint not found"));

        sprint.setMajorVersion(updatedSprint.getMajorVersion());
        sprint.setStartDate(updatedSprint.getStartDate());
        sprint.setEndDate(updatedSprint.getEndDate());
        sprint.setRegressionStart(updatedSprint.getRegressionStart());
        sprint.setRegressionEnd(updatedSprint.getRegressionEnd());

        if(updatedSprint.getTeamId() != null) {
            Team team = teamRepository.findById(updatedSprint.getTeamId())
                    .orElseThrow(() -> new NoSuchElementException("Team not found"));
            sprint.setTeam(team);
        }

        return sprintRepository.save(sprint);
    }

    public void deleteSprint(Integer id) {
        sprintRepository.deleteById(id);
    }

    public List<Release> getSprintReleases(Integer sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new NoSuchElementException("Sprint not found"));
        return releaseRepository.findAllBySprint(sprint, Sort.by(Sort.Direction.ASC, "releaseDate"));
    }

    public List<SprintTeamDto> getSprintsByYearAndTeam(Integer year, String teamName) {
        return sprintRepository.getSprintsByYearAndTeam(year, teamName)
                .stream().map(SprintTeamDto::new)
                .collect(Collectors.toList());
    }

    public List<UserStoryPointsDto> getStoryPointsPerUser(Integer sprintId) {
        return sprintRepository.getStoryPointsPerUser(sprintId)
                .stream().map(UserStoryPointsDto::new)
                .collect(Collectors.toList());
    }

    public Sprint getSprint(Integer sprintId) {
        return sprintRepository.findById(sprintId)
                .orElseThrow(() -> new NoSuchElementException("Sprint not found"));
    }
}
