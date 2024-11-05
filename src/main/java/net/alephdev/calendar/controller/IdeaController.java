package net.alephdev.calendar.controller;

import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.CurrentUser;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.IdeaDto;
import net.alephdev.calendar.models.Idea;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.service.IdeaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ideas")
@AuthorizedRequired
public class IdeaController {

    private final IdeaService ideaService;

    @Autowired
    public IdeaController(IdeaService ideaService) {
        this.ideaService = ideaService;
    }

    @GetMapping
    public List<Idea> getAllIdeas() {
        return ideaService.getAllIdeas();
    }

    @PostMapping
    public ResponseEntity<Idea> createIdea(@RequestBody IdeaDto idea, @CurrentUser User user) {
        Idea createdIdea = ideaService.createIdea(idea, user);
        return new ResponseEntity<>(createdIdea, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Idea> updateIdea(@PathVariable Integer id, @RequestBody IdeaDto updatedIdea, @CurrentUser User user) {
        Idea idea = ideaService.updateIdea(id, updatedIdea, user);
        return new ResponseEntity<>(idea, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PrivilegeRequired
    public ResponseEntity<Void> deleteIdea(@PathVariable Integer id) {
        ideaService.deleteIdea(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PrivilegeRequired
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> processIdea(
        @PathVariable Integer id,
        @RequestParam String status
    ) {
        ideaService.processIdea(id, status);
        return ResponseEntity.ok().build();
    }
}