package net.alephdev.calendar.models;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "Idea")
public class Idea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String description;

    @ManyToOne
    @JoinColumn(name = "author_login", foreignKey = @ForeignKey(name = "fk_idea_author_login"))
    private User authorLogin;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_enum_id", nullable = false)
    private Status statusEnumId;

    @ManyToOne
    @JoinColumn(name = "task_id", foreignKey = @ForeignKey(name = "fk_idea_task_id"))
    private Task task;

    public enum Status {
        PENDING, REJECTED, APPROVED;
    }
}
