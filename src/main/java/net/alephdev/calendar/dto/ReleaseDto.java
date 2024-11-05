package net.alephdev.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class ReleaseDto {
    private String version;
    private LocalDate releaseDate;
    private String description;
    private Integer sprintId;
}