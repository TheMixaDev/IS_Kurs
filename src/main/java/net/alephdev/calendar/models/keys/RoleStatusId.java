package net.alephdev.calendar.models.keys;

import lombok.Data;

import java.io.Serializable;

@Data
public class RoleStatusId implements Serializable {
    private Integer role;
    private Integer status;
}
