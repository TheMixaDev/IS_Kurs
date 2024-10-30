package net.alephdev.calendar.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Team")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    private String color;

    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
