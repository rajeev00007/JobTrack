package com.rajeev.jobtrack.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {


    // Job not found exception
    @ExceptionHandler(JobNotFoundException.class)
    public ResponseEntity<?> handleJobNotFound(JobNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        Map.of(
                                "message", ex.getMessage(),
                                "status", 404
                        )
                );
    }


    // Validation error exception
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(
            MethodArgumentNotValidException ex
    ) {

        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .toList();


        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        Map.of(
                                "errors", errors,
                                "status", 400
                        )
                );
    }

}