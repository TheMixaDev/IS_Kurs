package net.alephdev.calendar.controller;

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

    @Autowired
    public RoleController(RoleService roleService, StatusService statusService) {
        this.roleService = roleService;
        this.statusService = statusService;
    }

    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();
    }

    @PrivilegeRequired
    @PostMapping
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        Role createdRole = roleService.createRole(role);
        return new ResponseEntity<>(createdRole, HttpStatus.CREATED);
    }

    @PrivilegeRequired
    @PutMapping("/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable Integer id, @RequestBody Role updatedRole) {
        Role role = roleService.updateRole(id, updatedRole);
        return new ResponseEntity<>(role, HttpStatus.OK);
    }

    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Integer id) {
        try {
            roleService.deleteRole(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }

    @GetMapping("/{id}/statuses")
    public List<Status> getStatuses(@PathVariable Integer id) {
        return roleService.getStatuses(id);
    }

    @PrivilegeRequired
    @PostMapping("/{id}/statuses")
    public ResponseEntity<Void> addRoleStatus(@PathVariable Integer id, @RequestParam Integer statusId) {
        try {
            roleService.addRoleStatus(roleService.getRole(id), statusService.getStatus(statusId));
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }

    @PrivilegeRequired
    @DeleteMapping("/{id}/statuses")
    public ResponseEntity<Void> deleteRoleStatus(@PathVariable Integer id, @RequestParam Integer statusId) {
        try {
            roleService.removeRoleStatus(roleService.getRole(id), statusService.getStatus(statusId));
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }
}