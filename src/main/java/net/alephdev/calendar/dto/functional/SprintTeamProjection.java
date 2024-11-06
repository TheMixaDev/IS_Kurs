package net.alephdev.calendar.dto.functional;

import java.time.LocalDate;

public interface SprintTeamProjection {
    Integer getSprintId();
    String getMajorVersion();
    LocalDate getStartDate();
    LocalDate getEndDate();
    String getTeamName();
}
