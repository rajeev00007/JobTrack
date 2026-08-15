package com.rajeev.jobtrack.repository;

import com.rajeev.jobtrack.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    @Query("""
        SELECT j FROM Job j
        WHERE j.user.email = :email
        AND (:company IS NULL OR j.company = :company)
        AND (:status IS NULL OR j.status = :status)
        AND (:location IS NULL OR j.location = :location)
        """)
    List<Job> searchJobs(
            @Param("email") String email,
            @Param("company") String company,
            @Param("status") String status,
            @Param("location") String location
    );

    List<Job> findByUserEmail(String email);
    Optional<Job> findByIdAndUserEmail(Long id, String email);
    Page<Job> findByUserEmail(String email, Pageable pageable);

}