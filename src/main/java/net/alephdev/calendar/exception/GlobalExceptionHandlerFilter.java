package net.alephdev.calendar.exception;

import jakarta.persistence.EntityNotFoundException;
import net.alephdev.calendar.dto.MessageDto;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandlerFilter {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<MessageDto> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return new ResponseEntity<>(new MessageDto("Неверно введены данные"), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageDto> handleIllegalArgument(IllegalArgumentException ex) {
        return new ResponseEntity<>(new MessageDto(ex.getMessage()), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<MessageDto> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        return new ResponseEntity<>(new MessageDto("Неверный формат данных для передачи на сервер"), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({EntityNotFoundException.class, NoSuchElementException.class})
    public ResponseEntity<MessageDto> handleEntityNotFound(RuntimeException ex) {
        return new ResponseEntity<>(new MessageDto(ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, MissingServletRequestParameterException.class})
    public ResponseEntity<MessageDto> handleArgumentTypeMismatch(Exception ex) {
        return new ResponseEntity<>(new MessageDto("Неверный тип данных"), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidDataAccessApiUsageException.class)
    public ResponseEntity<MessageDto> handleInvalidDataAccessApiUsage(InvalidDataAccessApiUsageException ex) {
        return new ResponseEntity<>(new MessageDto(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(JpaSystemException.class)
    public ResponseEntity<MessageDto> handleJpaSystemException(JpaSystemException ex) {
        String errorMessage;
        try {
            errorMessage = Arrays.stream(
                    ex.getRootCause().getMessage()
                            .split("\\n")[0]
                            .split(":")
            )
                    .skip(1)
                    .collect(Collectors.joining(":"))
                    .trim();
        } catch (Exception e) {
            errorMessage = "Неверно введены данные";
        }
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<MessageDto> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        return new ResponseEntity<>(new MessageDto("Неизветсный пользователь, войдите в систему заново"), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<MessageDto> handleNullPointerException(NullPointerException ex) {
        ex.printStackTrace();
        return new ResponseEntity<>(new MessageDto("Неверно введены данные"), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageDto> handleGenericException(Exception ex) {
         String errorMessage = "Произошла непредвиденная ошибка";

        if (ex instanceof NullPointerException) {
            errorMessage = "Ошибка обработки данных: отсутствуют необходимые значения";
        } else if (ex instanceof IllegalArgumentException) {
            errorMessage = "Некорректные параметры запроса";
        } else if (ex instanceof IllegalStateException) {
            errorMessage = "Ошибка состояния приложения";
        } else if (ex instanceof IOException) {
            errorMessage = "Ошибка ввода/вывода";
        } else if (ex instanceof SQLException) {
            errorMessage = "Ошибка при работе с базой данных";
        }
        ex.printStackTrace();
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}