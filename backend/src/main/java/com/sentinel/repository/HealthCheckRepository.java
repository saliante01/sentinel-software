package com.sentinel.repository;

import com.sentinel.model.HealthCheck;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthCheckRepository extends JpaRepository<HealthCheck, Long> {

	void deleteByApplicationId(Long applicationId);

}
