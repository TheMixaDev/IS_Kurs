package net.alephdev.calendar.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "Task")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    private Integer storyPoints;

    @ManyToOne
    @JoinColumn(name = "implementer", foreignKey = @ForeignKey(name = "fk_task_implementer"))
    private User implementer;

    @ManyToOne
    @JoinColumn(name = "sprint_id", foreignKey = @ForeignKey(name = "fk_task_sprint_id"))
    private Sprint sprint;

    @ManyToOne
    @JoinColumn(name = "status_id", foreignKey = @ForeignKey(name = "fk_task_status_id"), nullable = false)
    private Status status;

    @Column(nullable = false)
    private String priorityEnum;

    @ManyToOne
    @JoinColumn(name = "created_by", foreignKey = @ForeignKey(name = "fk_task_created_by"))
    private User createdBy;

}
