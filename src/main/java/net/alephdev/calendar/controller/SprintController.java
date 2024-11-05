package net.alephdev.calendar.controller;

import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.functional.SprintTeamDto;
import net.alephdev.calendar.dto.functional.UserStoryPointsDto;
import net.alephdev.calendar.models.Sprint;
import net.alephdev.calendar.service.SprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
@AuthorizedRequired
public class SprintController {

    private final SprintService sprintService;

    @Autowired
    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @GetMapping
    public List<Sprint> getAllSprints() {
        return sprintService.getAllSprints();
    }

    @PrivilegeRequired
    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody Sprint sprint) {
        Sprint createdSprint = sprintService.createSprint(sprint);
        return new ResponseEntity<>(createdSprint, HttpStatus.CREATED);
    }

    @PrivilegeRequired
    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable Integer id, @RequestBody Sprint updatedSprint) {
        Sprint sprint = sprintService.updateSprint(id, updatedSprint);
        return new ResponseEntity<>(sprint, HttpStatus.OK);
    }

    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Integer id) {
        sprintService.deleteSprint(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Получение списка спринтов по году и команде с использованием функции пример
    @GetMapping("/by-year-and-team")
    public ResponseEntity<List<SprintTeamDto>> getSprintsByYearAndTeam(
            @RequestParam Integer year,
            @RequestParam(required = false) String teamName) {
        return ResponseEntity.ok(sprintService.getSprintsByYearAndTeam(year, teamName));
    }

    @GetMapping("/{sprintId}/story-points")
    public ResponseEntity<List<UserStoryPointsDto>> getStoryPointsPerUser(@PathVariable Integer sprintId) {
        return ResponseEntity.ok(sprintService.getStoryPointsPerUser(sprintId));
    }
}