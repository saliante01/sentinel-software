package com.sentinel.repository;

import com.sentinel.model.Incident;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
	List<Incident> findByApplicationIdOrderByStartedAtDesc(Long applicationId);
	List<Incident> findAllByOrderByStartedAtDesc();
	void deleteByApplicationId(Long applicationId);
}
