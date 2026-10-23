package com.sentinel.service;

import com.sentinel.client.CheckResult;
import com.sentinel.client.HttpCheckClient;
import com.sentinel.dto.HealthCheckResponse;
import com.sentinel.exception.ApplicationNotFoundException;
import com.sentinel.model.HealthCheck;
import com.sentinel.model.MonitoredApplication;
import com.sentinel.repository.HealthCheckRepository;
import com.sentinel.repository.MonitoredApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HealthCheckService {

	private final MonitoredApplicationRepository applicationRepository;
	private final HealthCheckRepository healthCheckRepository;
	private final HttpCheckClient httpCheckClient;

	public HealthCheckResponse check(Long applicationId) {
		MonitoredApplication application = applicationRepository.findById(applicationId)
				.orElseThrow(() -> new ApplicationNotFoundException(applicationId));

		CheckResult result = httpCheckClient.check(application);

		HealthCheck healthCheck = new HealthCheck();
		healthCheck.setApplication(application);
		healthCheck.setCheckedAt(result.checkedAt());
		healthCheck.setResponseTimeMs(result.responseTimeMs());
		healthCheck.setHttpStatus(result.httpStatus());
		healthCheck.setAvailable(result.available());
		healthCheck.setErrorMessage(result.errorMessage());

		return HealthCheckResponse.from(healthCheckRepository.save(healthCheck));
	}

}
