package net.alephdev.calendar.service;

import net.alephdev.calendar.models.Team;
import net.alephdev.calendar.repository.functional.TeamRepository;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
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
        return teamRepository.findAll(Sort.by(Sort.Direction.DESC, "isActive", "id"));
    }

    public List<Team> getActiveTeams() {
        return teamRepository.findAllByIsActive(true, Sort.by(Sort.Direction.DESC, "id"));
    }

    public Team createTeam(Team team) {
        team.setName(team.getName().trim());
        if(team.getDescription() != null)
            team.setDescription(team.getDescription().trim());
        teamRepository.findByName(team.getName()).ifPresent(existingTeam -> {
            throw new NoSuchElementException("Команда с таким названием уже существует");
        });
        return teamRepository.save(team);
    }

    public Team updateTeam(Integer id, Team updatedTeam) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Команда не найдена"));

        if(!team.getName().equals(updatedTeam.getName().trim())) {
            teamRepository.findByName(updatedTeam.getName().trim()).ifPresent(existingTeam -> {
                throw new NoSuchElementException("Команда с таким названием уже существует");
            });
            team.setName(updatedTeam.getName().trim());
        }
        team.setColor(updatedTeam.getColor());
        if(updatedTeam.getDescription() != null)
            team.setDescription(updatedTeam.getDescription().trim());
        team.setIsActive(updatedTeam.getIsActive());

        return teamRepository.save(team);
    }

    @Transactional
    public BigDecimal getTeamLoad(Integer teamId, Integer sprintId) {
        return teamRepository.calculateTeamLoad(teamId, sprintId);
    }

    public ResponseEntity<Void> deleteTeam(Integer id) {
        if (teamRepository.findById(id).isPresent()) {
            teamRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}