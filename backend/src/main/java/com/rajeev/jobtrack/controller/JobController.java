package com.rajeev.jobtrack.controller;

import com.rajeev.jobtrack.entity.Job;
import com.rajeev.jobtrack.response.ApiResponse;
import com.rajeev.jobtrack.service.JobService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.List;


@RestController
@RequestMapping("/jobs")
public class JobController {


    private final JobService jobService;


    public JobController(JobService jobService) {
        this.jobService = jobService;
    }


    @PostMapping
    public Job createJob(
            @Valid @RequestBody Job job,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return jobService.createJob(job, email);
    }



    @GetMapping
    public List<Job> getAllJobs(Authentication authentication) {

        String email = authentication.getName();

        return jobService.getAllJobs(email);
    }


    // PAGINATION + SORTING
    @GetMapping("/page")
    public Page<Job> getJobsWithPagination(
            Pageable pageable,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return jobService.getAllJobs(
                pageable,
                email
        );
    }


    // ADVANCED SEARCH
    @GetMapping("/search")
    public List<Job> searchJobs(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            Authentication  authentication
    ) {
        String email = authentication.getName();

        return jobService.searchJobs(
                company,
                status,
                location,
                email
        );
    }


    @GetMapping("/{id}")
    public Job getJobById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return jobService.getJobById(id, email);
    }


    @PutMapping("/{id}")
    public Job updateJob(
            @PathVariable Long id,
            @Valid @RequestBody Job job,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return jobService.updateJob(
                id,
                job,
                email
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteJob(
            @PathVariable Long id,
            Authentication authentication
    ) {

        String email = authentication.getName();

        jobService.deleteJob(id, email);

        return "Job deleted successfully";
    }
}