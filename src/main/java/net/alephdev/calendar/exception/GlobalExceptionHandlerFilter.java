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

import java.util.Arrays;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandlerFilter {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<MessageDto> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String errorMessage = "Invalid input data.";
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageDto> handleIllegalArgument(IllegalArgumentException ex) {
        String errorMessage = ex.getMessage();
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<MessageDto> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String errorMessage = "Invalid format.";
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({EntityNotFoundException.class, NoSuchElementException.class})
    public ResponseEntity<MessageDto> handleEntityNotFound(RuntimeException ex) {
        String errorMessage = ex.getMessage();
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, MissingServletRequestParameterException.class})
    public ResponseEntity<MessageDto> handleArgumentTypeMismatch(Exception ex) {
        String errorMessage = "Invalid parameters.";
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidDataAccessApiUsageException.class)
    public ResponseEntity<MessageDto> handleInvalidDataAccessApiUsage(InvalidDataAccessApiUsageException ex) {
        String errorMessage = ex.getMessage();
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
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
            errorMessage = "Invalid input data.";
        }
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<MessageDto> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        String errorMessage = "Unknown user, please login again.";
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<MessageDto> handleNullPointerException(NullPointerException ex) {
        String errorMessage = "Invalid input data.";
        ex.printStackTrace();
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageDto> handleGenericException(Exception ex) {
        String errorMessage = "An unexpected error occurred";
        ex.printStackTrace();
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}