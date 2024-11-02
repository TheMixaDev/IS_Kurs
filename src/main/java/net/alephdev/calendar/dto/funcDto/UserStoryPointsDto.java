package net.alephdev.calendar.dto.funcDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserStoryPointsDto {
    private String userLogin;
    private Long totalStoryPoints;
}
