package net.alephdev.calendar.controller;

import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.CurrentUser;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.functional.TopRiskDto;
import net.alephdev.calendar.models.Idea;
import net.alephdev.calendar.models.Risk;
import net.alephdev.calendar.models.Task;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.service.IdeaService;
import net.alephdev.calendar.service.RiskService;
import net.alephdev.calendar.service.TaskService;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/risks")
@AuthorizedRequired
@RequiredArgsConstructor
public class RiskController {

    private final RiskService riskService;
    private final TaskService taskService;
    private final IdeaService ideaService;

    @GetMapping
    public Page<Risk> getAllRisks(@RequestParam @DefaultValue("0") int page, @RequestParam String description) {
        return riskService.getAllRisks(page, description);
    }

    @PrivilegeRequired
    @PostMapping
    public ResponseEntity<Risk> createRisk(@RequestBody Risk risk) {
        Risk createdRisk = riskService.createRisk(risk);
        return new ResponseEntity<>(createdRisk, HttpStatus.CREATED);
    }

    @PrivilegeRequired
    @PutMapping("/{id}")
    public ResponseEntity<Risk> updateRisk(@PathVariable Integer id, @RequestBody Risk updatedRisk) {
        Risk risk = riskService.updateRisk(id, updatedRisk);
        return new ResponseEntity<>(risk, HttpStatus.OK);
    }

    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRisk(@PathVariable Integer id) {
        return riskService.deleteRisk(id);
    }

    @PostMapping("/task/{taskId}")
    public ResponseEntity<?> addRiskToTask(@PathVariable Integer taskId, @RequestParam Integer riskId, @CurrentUser User user) {
        Task task = taskService.getTask(taskId);
        Risk risk = riskService.getRisk(riskId);

        riskService.addRiskToTask(task, risk, user);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/task/{taskId}")
    public ResponseEntity<?> removeRiskFromTask(@PathVariable Integer taskId, @RequestParam Integer riskId, @CurrentUser User user) {
        Task task = taskService.getTask(taskId);
        Risk risk = riskService.getRisk(riskId);

        riskService.removeRiskFromTask(task, risk, user);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Risk>> getRisksForTask(@PathVariable Integer taskId) {
        Task task = taskService.getTask(taskId);
        List<Risk> risks = riskService.getRisksForTask(task);

        return ResponseEntity.ok(risks);
    }

    @PostMapping("/idea/{ideaId}")
    public ResponseEntity<?> addRiskToIdea(@PathVariable Integer ideaId, @RequestParam Integer riskId, @CurrentUser User user) {
        Idea idea = ideaService.getIdea(ideaId);
        Risk risk = riskService.getRisk(riskId);

        riskService.addRiskToIdea(idea, risk, user);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/idea/{ideaId}")
    public ResponseEntity<?> removeRiskFromIdea(@PathVariable Integer ideaId, @RequestParam Integer riskId, @CurrentUser User user) {
        Idea idea = ideaService.getIdea(ideaId);
        Risk risk = riskService.getRisk(riskId);

        riskService.removeRiskFromIdea(idea, risk, user);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/idea/{ideaId}")
    public ResponseEntity<List<Risk>> getRisksForIdea(@PathVariable Integer ideaId) {
        Idea idea = ideaService.getIdea(ideaId);
        List<Risk> risks = riskService.getRisksForIdea(idea);

        return ResponseEntity.ok(risks);
    }

    @GetMapping("/top10")
    public ResponseEntity<List<TopRiskDto>> getTop10TaskRisks() {
        return ResponseEntity.ok(riskService.getTop10TaskRisks());
    }
}