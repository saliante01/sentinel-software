package com.sentinel.repository;

import com.sentinel.model.Monitor;
import com.sentinel.model.MonitorType;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonitorRepository extends JpaRepository<Monitor, Long> {
	List<Monitor> findByApplicationIdOrderByCreatedAtDesc(Long applicationId);
	List<Monitor> findAllByOrderByCreatedAtDesc();
	@EntityGraph(attributePaths = "application")
	List<Monitor> findByActiveTrueAndTypeIn(List<MonitorType> types);
	void deleteByApplicationId(Long applicationId);
}
