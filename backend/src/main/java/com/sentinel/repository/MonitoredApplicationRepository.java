package com.sentinel.repository;

import com.sentinel.model.MonitoredApplication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonitoredApplicationRepository extends JpaRepository<MonitoredApplication, Long> {
}
