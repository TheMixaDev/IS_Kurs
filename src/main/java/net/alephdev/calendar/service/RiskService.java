package net.alephdev.calendar.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
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
    private final IdeaService ideaService;

    public Page<Risk> getAllRisks(int page, String description) {
        PageRequest pageRequest = PageRequest.of(page, 6, Sort.by(Sort.Direction.ASC, "id"));
        
        if (description != null && !description.trim().isEmpty()) {
            return riskRepository.findByDescriptionContainingIgnoreCase(description.trim(), pageRequest);
        }
        
        return riskRepository.findAll(pageRequest);
    }

    public Risk createRisk(Risk risk) {
        risk.setDescription(risk.getDescription().trim());
        riskRepository.findByDescription(risk.getDescription()).ifPresent(existingRisk -> {
            throw new IllegalArgumentException("Риск с таким названием уже существует");
        });
        return riskRepository.save(risk);
    }

    public Risk updateRisk(Integer id, Risk updatedRisk) {
        Risk risk = riskRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Риск не найден"));

        if (!risk.getDescription().equals(updatedRisk.getDescription().trim())) {
            riskRepository.findByDescription(updatedRisk.getDescription().trim()).ifPresent(existingRisk -> {
                throw new IllegalArgumentException("Риск с таким названием уже существует");
            });
            risk.setDescription(updatedRisk.getDescription().trim());
        }
        risk.setProbability(updatedRisk.getProbability());
        risk.setEstimatedLoss(updatedRisk.getEstimatedLoss());

        return riskRepository.save(risk);
    }

    public Risk getRisk(Integer id) {
        return riskRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Риск не найден"));
    }

    public ResponseEntity<Void> deleteRisk(Integer id) {
        if (riskRepository.findById(id).isPresent()) {
            riskRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Добавление риска к задаче
    public void addRiskToTask(Task task, Risk risk, User user) {
        if(!taskService.canEditTask(user, task)) {
            throw new IllegalArgumentException("Вы не можете добавлять риск к этой задаче");
        }
        TaskRisk taskRisk = new TaskRisk();
        taskRisk.setTask(task);
        taskRisk.setRisk(risk);
        taskRiskRepository.save(taskRisk);
    }

    public void removeRiskFromTask(Task task, Risk risk, User user) {
        if(!taskService.canEditTask(user, task)) {
            throw new IllegalArgumentException("Вы не можете удалять риск у этой задачи");
        }
        taskRiskRepository.deleteByTaskAndRisk(task, risk);
    }

    public List<Risk> getRisksForTask(Task task) {
        List<TaskRisk> taskRisks = taskRiskRepository.findAllByTask(task);
        return taskRisks.stream().map(TaskRisk::getRisk).collect(Collectors.toList());
    }

    public void addRiskToIdea(Idea idea, Risk risk, User user) {
        if(!ideaService.canEditIdea(idea, user)) {
            throw new IllegalArgumentException("Вы не можете добавлять риск к этой идее");
        }
        IdeaRisk ideaRisk = new IdeaRisk();
        ideaRisk.setIdea(idea);
        ideaRisk.setRisk(risk);
        ideaRiskRepository.save(ideaRisk);
    }

    public void removeRiskFromIdea(Idea idea, Risk risk, User user) {
        if(!ideaService.canEditIdea(idea, user)) {
            throw new IllegalArgumentException("Вы не можете добавлять риск у этой идеи");
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