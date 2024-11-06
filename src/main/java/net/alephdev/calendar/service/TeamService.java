package net.alephdev.calendar.service;

import net.alephdev.calendar.models.Team;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.repository.UserRepository;
import net.alephdev.calendar.repository.functional.TeamRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;

    public List<Team> getAllTeams() {
        return teamRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public List<Team> getActiveTeams() {
        return teamRepository.findAllByIsActive(true, Sort.by(Sort.Direction.ASC, "id"));
    }

    public Team createTeam(Team team) {
        return teamRepository.save(team);
    }

    public Team updateTeam(Integer id, Team updatedTeam) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Team not found"));

        team.setName(updatedTeam.getName());
        team.setColor(updatedTeam.getColor());
        team.setDescription(updatedTeam.getDescription());
        team.setIsActive(updatedTeam.getIsActive());

        return teamRepository.save(team);
    }

    @Transactional
    public BigDecimal getTeamLoad(Integer teamId, Integer sprintId) {
        return teamRepository.calculateTeamLoad(teamId, sprintId);
    }
}