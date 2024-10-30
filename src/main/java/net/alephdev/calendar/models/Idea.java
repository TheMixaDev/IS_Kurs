package net.alephdev.calendar.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Idea")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Idea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String description;

    @ManyToOne
    @JoinColumn(name = "author_login", foreignKey = @ForeignKey(name = "fk_idea_author_login"))
    private User authorLogin;

    @Column(name = "status_enum_id", nullable = false)
    private String statusEnumId;

    @ManyToOne
    @JoinColumn(name = "task_id", foreignKey = @ForeignKey(name = "fk_idea_task_id"))
    private Task task;
}
