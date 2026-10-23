package com.sentinel.repository;

import com.sentinel.model.Monitor;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonitorRepository extends JpaRepository<Monitor, Long> {
	List<Monitor> findByApplicationIdOrderByCreatedAtDesc(Long applicationId);
	void deleteByApplicationId(Long applicationId);
}
