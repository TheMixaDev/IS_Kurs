package net.alephdev.calendar.controller;

import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.CurrentUser;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.UserDto;
import net.alephdev.calendar.models.User;
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

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Page<User> getAllUsers(
            @RequestParam @DefaultValue("0") int page,
            @RequestParam(required = false) String login
    ) {
        if (login != null) {
            return userService.getAllUserWithPartialLogin(page, login);
        }
        return userService.getAllUsers(page);
    }

    @GetMapping("/current")
    public User getCurrentUser(@CurrentUser User user) {
        return user;
    }

    @PrivilegeRequired
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody UserDto userDto) {
        return new ResponseEntity<>(userService.register(userDto), HttpStatus.CREATED);
    }

    @PrivilegeRequired
    @PutMapping("/{login}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable String login, @RequestParam Integer roleId) {
        return new ResponseEntity<>(userService.updateRole(login, roleId), HttpStatus.OK);
    }

    @PrivilegeRequired
    @PutMapping("/{login}/team")
    public ResponseEntity<User> updateUserTeam(@PathVariable String login, @RequestParam(required = false) Integer teamId) {
        return new ResponseEntity<>(userService.updateUserTeam(login, teamId), HttpStatus.OK);
    }

    @PutMapping("/{login}")
    public ResponseEntity<User> updateUser(@PathVariable String login, @Valid @RequestBody UserDto userDto, @CurrentUser User currentUser) {
        if (currentUser.getLogin().equals(login) || userService.isPrivileged(currentUser)) {
            return new ResponseEntity<>(userService.updateUser(login, userDto), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }
}