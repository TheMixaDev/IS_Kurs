package net.alephdev.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@AllArgsConstructor
public class JwtRequestDto {
    @NotBlank(message = "Username cannot be empty")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private final String username;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private final String password;
}
