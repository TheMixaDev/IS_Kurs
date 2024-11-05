package net.alephdev.calendar.models;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "Role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    private String responsibilities;
}
