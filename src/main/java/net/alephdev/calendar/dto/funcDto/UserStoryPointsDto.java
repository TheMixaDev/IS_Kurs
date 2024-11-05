package net.alephdev.calendar.dto.funcDto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserStoryPointsDto {
    private final String userLogin;
    private final Long totalStoryPoints;
}
