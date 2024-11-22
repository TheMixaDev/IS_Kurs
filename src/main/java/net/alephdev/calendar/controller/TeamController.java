package net.alephdev.calendar.controller;

import net.alephdev.calendar.WebSocketHandler;
import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.ObjectDto;
import net.alephdev.calendar.models.Team;
import net.alephdev.calendar.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@AuthorizedRequired
public class TeamController {

    private final TeamService teamService;
    private final WebSocketHandler webSocketHandler;

    @Autowired
    public TeamController(TeamService teamService, WebSocketHandler webSocketHandler) {
        this.teamService = teamService;
        this.webSocketHandler = webSocketHandler;
    }

    @GetMapping
    public List<Team> getAllTeams(
            @RequestParam(required = false) boolean onlyActive
    ) {
        if(onlyActive) {
            return teamService.getActiveTeams();
        }
        return teamService.getAllTeams();
    }

    @PrivilegeRequired
    @PostMapping
    public ResponseEntity<Team> createTeam(@RequestBody Team team) {
        Team createdTeam = teamService.createTeam(team);
        webSocketHandler.notifyClients("team");
        return new ResponseEntity<>(createdTeam, HttpStatus.CREATED);
    }

    @PrivilegeRequired
    @PutMapping("/{id}")
    public ResponseEntity<Team> updateTeam(@PathVariable Integer id, @RequestBody Team updatedTeam) {
        Team team = teamService.updateTeam(id, updatedTeam);
        webSocketHandler.notifyClients("team", id);
        return new ResponseEntity<>(team, HttpStatus.OK);
    }

    @GetMapping("/load")
    public ResponseEntity<ObjectDto> getTeamLoad(
        @RequestParam Integer teamId,
        @RequestParam Integer sprintId
    ) {
        return ResponseEntity.ok(new ObjectDto(teamService.getTeamLoad(teamId, sprintId)));
    }

    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Integer id) {
        ResponseEntity<Void> result = teamService.deleteTeam(id);
        webSocketHandler.notifyClients("team", id);
        return result;
    }
}