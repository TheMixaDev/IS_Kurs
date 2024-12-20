package net.alephdev.calendar.controller;

import net.alephdev.calendar.WebSocketHandler;
import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.CurrentUser;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.UserDto;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.service.TaskService;
import net.alephdev.calendar.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/users")
@AuthorizedRequired
public class UserController {

    private final UserService userService;
    private final TaskService taskService;
    private final WebSocketHandler webSocketHandler;

    @Autowired
    public UserController(UserService userService, TaskService taskService, WebSocketHandler webSocketHandler) {
        this.userService = userService;
        this.taskService = taskService;
        this.webSocketHandler = webSocketHandler;
    }

    @GetMapping
    public Page<User> getAllUsers(
            @RequestParam @DefaultValue("0") int page,
            @RequestParam(required = false) String login,
            @RequestParam @DefaultValue("0") int team,
            @RequestParam(required = false) @DefaultValue("true") boolean onlyActive
    ) {
        if (login != null) {
            if(team != 0) return userService.getAllUsersWithPartialLoginAndTeam(page, login, team);
            if(onlyActive) return userService.getAllUsersWithPartialLoginActive(page, login);
            return userService.getAllUserWithPartialLogin(page, login);
        }
        return userService.getAllUsers(page);
    }

    @GetMapping("/current")
    public User getCurrentUser(@CurrentUser User user) {
        user.setCanCreateTasks(taskService.canCreateTask(user));
        return user;
    }

    @PrivilegeRequired
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody UserDto userDto) {
        User user = userService.register(userDto);
        webSocketHandler.notifyClients("user");
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @PrivilegeRequired
    @PutMapping("/{login}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable String login, @RequestParam Integer roleId) {
        User user = userService.updateRole(login, roleId);
        webSocketHandler.notifyClients("user", login);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PrivilegeRequired
    @PutMapping("/{login}/team")
    public ResponseEntity<User> updateUserTeam(@PathVariable String login, @RequestParam(required = false) Integer teamId) {
        User user = userService.updateUserTeam(login, teamId);
        webSocketHandler.notifyClients("user", login);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("/{login}")
    public ResponseEntity<User> updateUser(@PathVariable String login, @Valid @RequestBody UserDto userDto, @CurrentUser User currentUser) {
        if (currentUser.getLogin().equals(login) || userService.isPrivileged(currentUser)) {
            User user = userService.updateUser(login, userDto);
            webSocketHandler.notifyClients("user", login);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }

    @DeleteMapping("/{login}")
    public ResponseEntity<Void> wipeUser(@PathVariable String login, @CurrentUser User currentUser) {
        if (userService.isPrivileged(currentUser)) {
            userService.wipeUser(login);
            webSocketHandler.notifyClients("userWipe", login);
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }
}