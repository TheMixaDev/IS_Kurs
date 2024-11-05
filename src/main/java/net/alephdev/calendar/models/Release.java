package net.alephdev.calendar.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "Releases")
public class Release {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String version;

    @Column(nullable = false)
    private LocalDate releaseDate;

    private String description;

    @ManyToOne
    @JoinColumn(name = "sprint_id", foreignKey = @ForeignKey(name = "fk_releases_sprint_id"))
    private Sprint sprint;

}
