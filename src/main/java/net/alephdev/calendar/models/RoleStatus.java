package net.alephdev.calendar.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.alephdev.calendar.models.keys.RoleStatusId;

@Data
@Entity
@IdClass(RoleStatusId.class)
@AllArgsConstructor
@NoArgsConstructor
public class RoleStatus {
    @Id
    @ManyToOne
    @JoinColumn(name = "role_id", foreignKey = @ForeignKey(name = "fk_role_status_role_id"))
    private Role role;

    @Id
    @ManyToOne
    @JoinColumn(name = "status_id", foreignKey = @ForeignKey(name = "fk_role_status_status_id"))
    private Status status;
}
