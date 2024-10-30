package net.alephdev.calendar.models;

import jakarta.persistence.*;
import lombok.Data;
import net.alephdev.calendar.models.keys.TaskRiskId;

@Data
@Entity
@IdClass(TaskRiskId.class)
public class TaskRisk {
    @Id
    @ManyToOne
    @JoinColumn(name = "task_id", foreignKey = @ForeignKey(name = "fk_task_risk_task_id"))
    private Task task;

    @Id
    @ManyToOne
    @JoinColumn(name = "risk_id", foreignKey = @ForeignKey(name = "fk_task_risk_risk_id"))
    private Risk risk;
}
