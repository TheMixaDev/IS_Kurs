package net.alephdev.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserLoginDto {
    private final String username;
    private final String password;
}
