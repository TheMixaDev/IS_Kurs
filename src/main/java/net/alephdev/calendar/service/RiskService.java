package net.alephdev.calendar.service;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.dto.functional.TopRiskDto;
import net.alephdev.calendar.models.*;
import net.alephdev.calendar.repository.*;
import net.alephdev.calendar.repository.functional.RiskRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class RiskService {
    private final RiskRepository riskRepository;
    private final TaskRiskRepository taskRiskRepository;
    private final IdeaRiskRepository ideaRiskRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final IdeaService ideaService;

    public Page<Risk> getAllRisks(int page) {
        return riskRepository.findAll(PageRequest.of(page, 20, Sort.by(Sort.Direction.ASC, "id")));
    }

    public Risk createRisk(Risk risk) {
        return riskRepository.save(risk);
    }

    public Risk updateRisk(Integer id, Risk updatedRisk) {
        Risk risk = riskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Risk not found"));

        risk.setDescription(updatedRisk.getDescription());
        risk.setProbability(updatedRisk.getProbability());
        risk.setEstimatedLoss(updatedRisk.getEstimatedLoss());

        return riskRepository.save(risk);
    }

    public Risk getRisk(Integer id) {
        return riskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Risk not found"));
    }

    public void deleteRisk(Integer id) {
        riskRepository.deleteById(id);
    }

    // Добавление риска к задаче
    public void addRiskToTask(Task task, Risk risk, User user) {
        if(!taskService.canEditTask(user, task)) {
            throw new IllegalArgumentException("You are not allowed to add risks to this task");
        }
        TaskRisk taskRisk = new TaskRisk();
        taskRisk.setTask(task);
        taskRisk.setRisk(risk);
        taskRiskRepository.save(taskRisk);
    }

    public void removeRiskFromTask(Task task, Risk risk, User user) {
        if(!taskService.canEditTask(user, task)) {
            throw new IllegalArgumentException("You are not allowed to remove risks from this task");
        }
        taskRiskRepository.deleteByTaskAndRisk(task, risk);
    }

    public List<Risk> getRisksForTask(Task task) {
        List<TaskRisk> taskRisks = taskRiskRepository.findAllByTask(task);
        return taskRisks.stream().map(TaskRisk::getRisk).collect(Collectors.toList());
    }

    // Добавление риска к идее
    public void addRiskToIdea(Idea idea, Risk risk, User user) {
        if(!ideaService.canEditIdea(idea, user)) {
            throw new IllegalArgumentException("You are not allowed to add risks to this idea");
        }
        IdeaRisk ideaRisk = new IdeaRisk();
        ideaRisk.setIdea(idea);
        ideaRisk.setRisk(risk);
        ideaRiskRepository.save(ideaRisk);
    }

    public void removeRiskFromIdea(Idea idea, Risk risk, User user) {
        if(!ideaService.canEditIdea(idea, user)) {
            throw new IllegalArgumentException("You are not allowed to remove risks from this idea");
        }
        ideaRiskRepository.deleteByIdeaAndRisk(idea, risk);
    }

    public List<Risk> getRisksForIdea(Idea idea) {
        List<IdeaRisk> ideaRisks = ideaRiskRepository.findAllByIdea(idea);
        return ideaRisks.stream().map(IdeaRisk::getRisk).collect(Collectors.toList());
    }

    public List<TopRiskDto> getTop10TaskRisks() {
        return riskRepository.getTop10TaskRisks()
                .stream().map(TopRiskDto::new)
                .collect(Collectors.toList());
    }
}