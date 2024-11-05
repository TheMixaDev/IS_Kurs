package net.alephdev.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.alephdev.calendar.models.Role;
import net.alephdev.calendar.models.Team;
import net.alephdev.calendar.models.User;

@Getter
@AllArgsConstructor
public class UserPublicDto {
    private String login;
    private String firstName;
    private String lastName;
    private String email;
    private Team team;
    private Role role;

    public UserPublicDto(User user) {
        this.login = user.getLogin();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.team = user.getTeam();
        this.role = user.getRole();
    }
}
