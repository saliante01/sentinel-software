package com.sentinel.repository;

import com.sentinel.model.HealthCheck;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthCheckRepository extends JpaRepository<HealthCheck, Long> {

	void deleteByApplicationId(Long applicationId);

	Page<HealthCheck> findByApplicationId(Long applicationId, Pageable pageable);

}
