package net.alephdev.calendar.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Status {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    private String description;
}
