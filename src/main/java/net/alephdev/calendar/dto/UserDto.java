package net.alephdev.calendar.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserDto {
    @NotBlank(message = "Login is required")
    @Size(min = 3, max = 50, message = "Login must be between 3 and 50 characters")
    private final String login;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private final String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private final String password;

    @NotBlank(message = "First name is required")
    private final String firstName;

    @NotBlank(message = "Last name is required")
    private final String lastName;
}