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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

	@Transactional(readOnly = true)
	public Page<HealthCheckResponse> history(Long applicationId, int page, int size) {
		if (page < 0 || size < 1) throw new IllegalArgumentException("page must be at least 0 and size at least 1");
		if (!applicationRepository.existsById(applicationId)) {
			throw new ApplicationNotFoundException(applicationId);
		}
		PageRequest pageable = PageRequest.of(page, Math.min(size, 100),
				Sort.by(Sort.Direction.DESC, "checkedAt"));
		return healthCheckRepository.findByApplicationId(applicationId, pageable)
				.map(HealthCheckResponse::from);
	}

}
