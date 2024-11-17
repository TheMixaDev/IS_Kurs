package net.alephdev.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.alephdev.calendar.models.User;

@Getter
@AllArgsConstructor
public class JwtResponseDto {
    private final String token;
    private final User user;
}
