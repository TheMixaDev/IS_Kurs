package net.alephdev.calendar.models.keys;

import lombok.Data;

import java.io.Serializable;

@Data
public class TaskRiskId implements Serializable {
    private Integer task;
    private Integer risk;
}
