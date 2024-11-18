package net.alephdev.calendar.controller;

import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.SprintDto;
import net.alephdev.calendar.dto.functional.SprintTeamDto;
import net.alephdev.calendar.dto.functional.UserStoryPointsDto;
import net.alephdev.calendar.models.Release;
import net.alephdev.calendar.models.Sprint;
import net.alephdev.calendar.service.SprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.data.domain.Page;
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
    public Page<Sprint> getAllSprints(@RequestParam @DefaultValue("0") int page) {
        return sprintService.getAllSprints(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprint(@PathVariable Integer id) {
        Sprint sprint = sprintService.getSprint(id);
        return new ResponseEntity<>(sprint, HttpStatus.OK);
    }

    @PrivilegeRequired
    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody SprintDto sprint) {
        Sprint createdSprint = sprintService.createSprint(sprint);
        return new ResponseEntity<>(createdSprint, HttpStatus.CREATED);
    }

    @PrivilegeRequired
    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable Integer id, @RequestBody SprintDto updatedSprint) {
        Sprint sprint = sprintService.updateSprint(id, updatedSprint);
        return new ResponseEntity<>(sprint, HttpStatus.OK);
    }

    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Integer id) {
        
        return sprintService.deleteSprint(id);
    }

    // Получение списка спринтов по году и команде с использованием функции
    @GetMapping("/filtered")
    public ResponseEntity<List<SprintTeamDto>> getSprintsByYearAndTeam(
            @RequestParam Integer year,
            @RequestParam(required = false) String teamName) {
        return ResponseEntity.ok(sprintService.getSprintsByYearAndTeam(year, teamName));
    }

    @GetMapping("/{sprintId}/story-points")
    public ResponseEntity<List<UserStoryPointsDto>> getStoryPointsPerUser(@PathVariable Integer sprintId) {
        return ResponseEntity.ok(sprintService.getStoryPointsPerUser(sprintId));
    }

    @GetMapping("/{id}/releases")
    public List<Release> getSprintReleases(@PathVariable Integer id) {
        return sprintService.getSprintReleases(id);
    }
}