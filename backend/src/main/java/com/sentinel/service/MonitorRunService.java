package com.sentinel.service;

import com.sentinel.client.CheckResult;
import com.sentinel.client.HttpCheckClient;
import com.sentinel.dto.MonitorRunResponse;
import com.sentinel.exception.ApplicationNotFoundException;
import com.sentinel.exception.BrowserJourneyWorkerRequiredException;
import com.sentinel.exception.InvalidApplicationConfigurationException;
import com.sentinel.exception.ResourceNotFoundException;
import com.sentinel.model.Monitor;
import com.sentinel.model.MonitorRun;
import com.sentinel.model.MonitorType;
import com.sentinel.repository.MonitorRepository;
import com.sentinel.repository.MonitorRunRepository;
import com.sentinel.repository.MonitoredApplicationRepository;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class MonitorRunService {
	private final MonitorRunRepository repository;
	private final MonitorRepository monitorRepository;
	private final MonitoredApplicationRepository applicationRepository;
	private final HttpCheckClient httpCheckClient;

	@Transactional
	public MonitorRunResponse run(Long applicationId, Long monitorId) {
		return execute(getMonitor(applicationId, monitorId));
	}

	@Transactional
	public MonitorRunResponse runScheduled(Monitor monitor) {
		return execute(monitor);
	}

	private MonitorRunResponse execute(Monitor monitor) {
		if (monitor.getType() == MonitorType.BROWSER_JOURNEY) throw new BrowserJourneyWorkerRequiredException();
		String method = monitor.getMethod() == null ? "GET" : monitor.getMethod().toUpperCase(Locale.ROOT);
		if (!method.equals("GET") && !method.equals("HEAD")) {
			throw new InvalidApplicationConfigurationException("Only GET and HEAD monitor methods can be executed");
		}
		if (monitor.getUrl() == null || monitor.getUrl().isBlank()) {
			throw new InvalidApplicationConfigurationException("Monitor URL is required for execution");
		}

		CheckResult result = httpCheckClient.check(monitor.getApplication(), monitor.getUrl(), HttpMethod.valueOf(method));
		boolean success = isExpectedStatus(monitor, result.httpStatus());
		MonitorRun run = new MonitorRun();
		run.setMonitor(monitor);
		run.setCheckedAt(result.checkedAt());
		run.setDurationMs(result.responseTimeMs());
		run.setStatus(result.httpStatus());
		run.setSuccess(success);
		run.setError(success ? null : result.errorMessage());
		run.setConfig(monitor.getConfig());
		run.setEvidence(result.evidence());
		return MonitorRunResponse.from(repository.save(run));
	}

	static boolean isExpectedStatus(Monitor monitor, Integer status) {
		if (status == null) return false;
		if (monitor.getConfig() != null) {
			var statuses = monitor.getConfig().get("expectedStatuses");
			if (statuses != null && statuses.isArray()) {
				for (var expected : statuses) {
					if (expected.isIntegralNumber() && expected.asInt() == status) return true;
				}
				return false;
			}
			var expected = monitor.getConfig().get("expectedStatus");
			if (expected != null && expected.isIntegralNumber()) return expected.asInt() == status;
		}
		return status >= 200 && status < 300;
	}

	@Transactional(readOnly = true)
	public Page<MonitorRunResponse> findAll(Long applicationId, Long monitorId, int page, int size) {
		if (page < 0 || size < 1) throw new IllegalArgumentException("page must be at least 0 and size at least 1");
		getMonitor(applicationId, monitorId);
		return repository.findByMonitorId(monitorId, PageRequest.of(page, Math.min(size, 100),
				Sort.by(Sort.Direction.DESC, "checkedAt"))).map(MonitorRunResponse::from);
	}

	private Monitor getMonitor(Long applicationId, Long monitorId) {
		if (!applicationRepository.existsById(applicationId)) throw new ApplicationNotFoundException(applicationId);
		Monitor monitor = monitorRepository.findById(monitorId)
				.orElseThrow(() -> new ResourceNotFoundException("Monitor", monitorId));
		if (!monitor.getApplication().getId().equals(applicationId)) throw new ResourceNotFoundException("Monitor", monitorId);
		return monitor;
	}
}
