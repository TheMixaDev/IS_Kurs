package net.alephdev.calendar.dto.funcDto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SprintTeamDto {
    private Integer sprintId;
    private String majorVersion;
    private LocalDate startDate;
    private LocalDate endDate;
    private String teamName;
}
