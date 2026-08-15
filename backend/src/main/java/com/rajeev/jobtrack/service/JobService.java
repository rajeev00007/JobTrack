package com.rajeev.jobtrack.service;

import com.rajeev.jobtrack.entity.Job;
import com.rajeev.jobtrack.entity.User;
import com.rajeev.jobtrack.exception.JobNotFoundException;
import com.rajeev.jobtrack.repository.JobRepository;
import com.rajeev.jobtrack.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobService(
            JobRepository jobRepository,
            UserRepository userRepository
    ) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // CREATE
    public Job createJob(Job job, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        job.setUser(user);

        return jobRepository.save(job);
    }

    // SEARCH
    public List<Job> searchJobs(
            String company,
            String status,
            String location,
            String email
    ) {

        return jobRepository.searchJobs(
                email,
                company,
                status,
                location
        );
    }

    // READ ALL - USER SPECIFIC
    public List<Job> getAllJobs(String email) {

        return jobRepository.findByUserEmail(email);
    }

    // PAGINATION + SORTING
    public Page<Job> getAllJobs(
            Pageable pageable,
            String email
    ) {
        return jobRepository.findByUserEmail(email, pageable);
    }

    // READ ONE - USER SPECIFIC
    public Job getJobById(Long id, String email) {

        return jobRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new JobNotFoundException(id));
    }

    // UPDATE
    public Job updateJob(
            Long id,
            Job updatedJob,
            String email
    ) {

        Job existingJob = jobRepository
                .findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new JobNotFoundException(id));

        existingJob.setCompany(updatedJob.getCompany());
        existingJob.setPosition(updatedJob.getPosition());
        existingJob.setStatus(updatedJob.getStatus());
        existingJob.setLocation(updatedJob.getLocation());
        existingJob.setNotes(updatedJob.getNotes());
        existingJob.setPriority(updatedJob.getPriority());

        return jobRepository.save(existingJob);
    }

    // DELETE
    public void deleteJob(Long id, String email) {

        Job job = jobRepository
                .findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new JobNotFoundException(id));

        jobRepository.delete(job);
    }
}