package com.sentinel.repository;

import com.sentinel.model.MonitorRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonitorRunRepository extends JpaRepository<MonitorRun, Long> {
	Page<MonitorRun> findByMonitorId(Long monitorId, Pageable pageable);
	void deleteByMonitorId(Long monitorId);
	void deleteByMonitorApplicationId(Long applicationId);
}
