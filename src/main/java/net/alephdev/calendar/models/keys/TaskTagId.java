package net.alephdev.calendar.models.keys;

import lombok.Data;

import java.io.Serializable;

@Data
public class TaskTagId implements Serializable {
    private Integer task;
    private Integer tag;
}
