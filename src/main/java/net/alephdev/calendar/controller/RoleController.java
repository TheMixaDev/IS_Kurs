package net.alephdev.calendar.controller;

import net.alephdev.calendar.WebSocketHandler;
import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.models.Role;
import net.alephdev.calendar.models.Status;
import net.alephdev.calendar.service.RoleService;
import net.alephdev.calendar.service.StatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@AuthorizedRequired
public class RoleController {

    private final RoleService roleService;
    private final StatusService statusService;
    private final WebSocketHandler webSocketHandler;

    @Autowired
    public RoleController(RoleService roleService, StatusService statusService, WebSocketHandler webSocketHandler) {
        this.roleService = roleService;
        this.statusService = statusService;
        this.webSocketHandler = webSocketHandler;
    }

    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();
    }

    @PrivilegeRequired
    @PostMapping
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        Role createdRole = roleService.createRole(role);
        webSocketHandler.notifyClients("role");
        return new ResponseEntity<>(createdRole, HttpStatus.CREATED);
    }

    @PrivilegeRequired
    @PutMapping("/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable Integer id, @RequestBody Role updatedRole) {
        Role role = roleService.updateRole(id, updatedRole);
        webSocketHandler.notifyClients("role", role.getId());
        return new ResponseEntity<>(role, HttpStatus.OK);
    }

    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Integer id) {
        ResponseEntity<Void> result = roleService.deleteRole(id);
        webSocketHandler.notifyClients("role", id);
        return result;
    }

    @GetMapping("/{id}/statuses")
    public List<Status> getStatuses(@PathVariable Integer id) {
        return roleService.getStatuses(id);
    }

    @PrivilegeRequired
    @PostMapping("/{id}/statuses")
    public ResponseEntity<Void> addRoleStatus(@PathVariable Integer id, @RequestParam Integer statusId) {
        roleService.addRoleStatus(roleService.getRole(id), statusService.getStatus(statusId));
        webSocketHandler.notifyClients("role", id);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PrivilegeRequired
    @DeleteMapping("/{id}/statuses")
    public ResponseEntity<Void> deleteRoleStatus(@PathVariable Integer id, @RequestParam Integer statusId) {
        roleService.removeRoleStatus(roleService.getRole(id), statusService.getStatus(statusId));
        webSocketHandler.notifyClients("role", id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}