package net.alephdev.calendar.controller;

import net.alephdev.calendar.WebSocketHandler;
import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.CurrentUser;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.IdeaDto;
import net.alephdev.calendar.models.Idea;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.service.IdeaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ideas")
@AuthorizedRequired
public class IdeaController {

    private final IdeaService ideaService;
    private final WebSocketHandler webSocketHandler;

    @Autowired
    public IdeaController(IdeaService ideaService, WebSocketHandler webSocketHandler) {
        this.ideaService = ideaService;
        this.webSocketHandler = webSocketHandler;
    }

    @GetMapping
    public Page<Idea> getAllIdeas(
            @RequestParam @DefaultValue("0") int page,
            @RequestParam(required = false) Idea.Status status
    ) {
        if(status != null) {
            return ideaService.getAllIdeasByStatus(status, page);
        }
        return ideaService.getAllIdeas(page);
    }

    @PostMapping
    public ResponseEntity<Idea> createIdea(@RequestBody IdeaDto idea, @CurrentUser User user) {
        Idea createdIdea = ideaService.createIdea(idea, user);
        webSocketHandler.notifyClients("idea");
        return new ResponseEntity<>(createdIdea, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Idea> updateIdea(@PathVariable Integer id, @RequestBody IdeaDto updatedIdea, @CurrentUser User user) {
        Idea idea = ideaService.updateIdea(id, updatedIdea, user);
        webSocketHandler.notifyClients("idea", id);
        return new ResponseEntity<>(idea, HttpStatus.OK);
    }

    @PrivilegeRequired
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> processIdea(
        @PathVariable Integer id,
        @RequestParam Idea.Status status
    ) {
        ideaService.processIdea(id, status.toString());
        webSocketHandler.notifyClients("idea");
        return ResponseEntity.ok().build();
    }
}