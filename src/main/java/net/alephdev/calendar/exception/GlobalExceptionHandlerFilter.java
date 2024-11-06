package net.alephdev.calendar.exception;

import jakarta.persistence.EntityNotFoundException;
import net.alephdev.calendar.dto.MessageDto;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandlerFilter {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<MessageDto> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String errorMessage = "Invalid input data. Please check the request body.";
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageDto> handleIllegalArgument(IllegalArgumentException ex) {
        String errorMessage = ex.getMessage();
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<MessageDto> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String errorMessage = "Invalid JSON format. Please check the request body.";
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({EntityNotFoundException.class, NoSuchElementException.class})
    public ResponseEntity<MessageDto> handleEntityNotFound(RuntimeException ex) {
        String errorMessage = ex.getMessage();
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, MissingServletRequestParameterException.class})
    public ResponseEntity<MessageDto> handleArgumentTypeMismatch(Exception ex) {
        String errorMessage = "Invalid request parameters. Please check the request.";
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidDataAccessApiUsageException.class)
    public ResponseEntity<MessageDto> handleInvalidDataAccessApiUsage(InvalidDataAccessApiUsageException ex) {
        String errorMessage = ex.getMessage();
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<MessageDto> handleNullPointerException(NullPointerException ex) {
        String errorMessage = "Server error";
        ex.printStackTrace(); // Оставляем для логирования
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageDto> handleGenericException(Exception ex) {
        String errorMessage = "An unexpected error occurred";
        ex.printStackTrace(); // Оставляем для логирования
        return new ResponseEntity<>(new MessageDto(errorMessage), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}