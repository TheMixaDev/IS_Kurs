package net.alephdev.calendar.service;

import net.alephdev.calendar.models.Sprint;
import net.alephdev.calendar.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
}