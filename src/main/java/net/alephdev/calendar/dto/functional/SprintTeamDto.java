package net.alephdev.calendar.dto.functional;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SprintTeamDto {
    private final Integer sprintId;
    private final String majorVersion;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String teamName;

    public SprintTeamDto(SprintTeamProjection projection) {
        this(projection.getSprintId(), projection.getMajorVersion(), projection.getStartDate(), projection.getEndDate(), projection.getTeamName());
    }
}
