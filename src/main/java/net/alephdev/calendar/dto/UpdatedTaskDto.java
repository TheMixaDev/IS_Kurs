package net.alephdev.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.alephdev.calendar.models.Task;

@Getter
@AllArgsConstructor
public class UpdatedTaskDto {
    private String name;
    private Integer storyPoints;
    private Task.Priority priorityEnum;
}