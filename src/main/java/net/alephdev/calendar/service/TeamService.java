package net.alephdev.calendar.service;

import net.alephdev.calendar.models.Team;
import net.alephdev.calendar.repository.repoWithFunc.TeamRepository;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Team createTeam(Team team) {
        return teamRepository.save(team);
    }

    public Team updateTeam(Integer id, Team updatedTeam) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        team.setName(updatedTeam.getName());
        team.setColor(updatedTeam.getColor());
        team.setDescription(updatedTeam.getDescription());
        team.setIsActive(updatedTeam.getIsActive()); // Update isActive field

        return teamRepository.save(team);
    }

    public void deleteTeam(Integer id) {
        teamRepository.deleteById(id);
    }

    @Transactional
    public BigDecimal getTeamLoad(Integer teamId, Integer sprintId) {
        return teamRepository.calculateTeamLoad(teamId, sprintId);
    }
}