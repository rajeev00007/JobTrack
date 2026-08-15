package com.rajeev.jobtrack.exception;

public class JobNotFoundException extends RuntimeException {

    public JobNotFoundException(Long id) {
        super("Job not found with id: " + id);
    }
}