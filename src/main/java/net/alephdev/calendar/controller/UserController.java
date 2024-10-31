package net.alephdev.calendar.controller;

import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.CurrentUser;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.UserDto;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PrivilegeRequired
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody UserDto userDto) {
        try {
            return new ResponseEntity<>(userService.register(userDto), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PrivilegeRequired
    @PostMapping("/{login}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable String login, @RequestParam Integer roleId) {
        try {
            return new ResponseEntity<>(userService.updateRole(login, roleId), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PrivilegeRequired
    @PutMapping("/{login}/team")
    public ResponseEntity<User> updateUserTeam(@PathVariable String login, @RequestParam(required = false) Integer teamId) {
        try {
            User updatedUser = userService.updateUserTeam(login, teamId);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @AuthorizedRequired
    @PutMapping("/{login}")
    public ResponseEntity<User> updateUser(@PathVariable String login, @RequestBody UserDto userDto, @CurrentUser User currentUser) {
        if (currentUser.getLogin().equals(login) || userService.isPrivileged(currentUser)) {
            try {
                return new ResponseEntity<>(userService.updateUser(login, userDto), HttpStatus.OK);
            } catch (IllegalArgumentException e) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }
}