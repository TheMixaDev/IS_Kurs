package net.alephdev.calendar.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserDto {
    @NotBlank(message = "Логин не должен быть пустой")
    @Size(min = 3, max = 50, message = "Логин должен быть от 3 до 50 символов")
    private final String login;

    @NotBlank(message = "Почта не должна быть пустой")
    @Email(message = "Неверный формат почты")
    private final String email;

    @NotBlank(message = "Пароль не должен быть пустой")
    @Size(min = 6, message = "Пароль должен быть от 6 символов")
    private final String password;

    @NotBlank(message = "Имя не должно быть пустым")
    private final String firstName;

    @NotBlank(message = "Фамилия не должна быть пустой")
    private final String lastName;
}