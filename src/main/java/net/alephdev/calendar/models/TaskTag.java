package net.alephdev.calendar.models;

import jakarta.persistence.*;
import lombok.Data;
import net.alephdev.calendar.models.keys.TaskTagId;

@Data
@Entity
@IdClass(TaskTagId.class)
public class TaskTag {
    @Id
    @ManyToOne
    @JoinColumn(name = "task_id", foreignKey = @ForeignKey(name = "fk_task_tag_task_id"))
    private Task task;

    @Id
    @ManyToOne
    @JoinColumn(name = "tag_id", foreignKey = @ForeignKey(name = "fk_task_tag_tag_id"))
    private Tag tag;
}
