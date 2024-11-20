package net.alephdev.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@AllArgsConstructor
public class JwtRequestDto {
    @NotBlank(message = "Имя не должно быть пустое")
    @Size(min = 3, max = 50, message = "Имя должно быть от 3 до 50 символов")
    private final String username;

    @NotBlank(message = "Пароль не должен быть пустой")
    @Size(min = 6, max = 100, message = "Пароль должен быть от 6 до 100 символов")
    private final String password;
}
