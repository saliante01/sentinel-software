package com.sentinel.repository;

import com.sentinel.model.ServiceDependency;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceDependencyRepository extends JpaRepository<ServiceDependency, Long> {
	List<ServiceDependency> findByApplicationIdOrderByNameAsc(Long applicationId);
	void deleteByApplicationId(Long applicationId);
}
