package net.alephdev.calendar.service;

import net.alephdev.calendar.models.Team;
import net.alephdev.calendar.repository.repoWithFunc.TeamRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;

    @Autowired
    public TeamService(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

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

    public BigDecimal getTeamLoad(Integer teamId, Integer sprintId) {
        return teamRepository.calculateTeamLoad(teamId, sprintId);
    }
}