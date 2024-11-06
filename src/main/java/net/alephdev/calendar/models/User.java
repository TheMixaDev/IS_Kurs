package net.alephdev.calendar.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "Users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String login;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    private String firstName;

    private String lastName;

    private String email;

    @ManyToOne
    @JoinColumn(name = "team_id", foreignKey = @ForeignKey(name = "fk_users_team_id"))
    private Team team;

    @ManyToOne
    @JoinColumn(name = "role_id", foreignKey = @ForeignKey(name = "fk_users_role_id"))
    private Role role;

}
