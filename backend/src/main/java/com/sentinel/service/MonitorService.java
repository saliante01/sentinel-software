package com.sentinel.service;

import com.sentinel.dto.MonitorRequest;
import com.sentinel.dto.MonitorResponse;
import com.sentinel.exception.ApplicationNotFoundException;
import com.sentinel.exception.InvalidApplicationConfigurationException;
import com.sentinel.exception.ResourceNotFoundException;
import com.sentinel.model.Monitor;
import com.sentinel.model.MonitorType;
import com.sentinel.model.MonitoredApplication;
import com.sentinel.repository.MonitorRepository;
import com.sentinel.repository.MonitorRunRepository;
import com.sentinel.repository.MonitoredApplicationRepository;
import com.sentinel.security.AllowedTargetPolicy;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class MonitorService {
	private final MonitorRepository repository;
	private final MonitoredApplicationRepository applicationRepository;
	private final MonitorRunRepository runRepository;
	private final AllowedTargetPolicy targetPolicy;

	@Transactional(readOnly = true)
	public List<MonitorResponse> findAll(Long applicationId) {
		requireApplication(applicationId);
		return repository.findByApplicationIdOrderByCreatedAtDesc(applicationId).stream()
				.map(MonitorResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public MonitorResponse findById(Long applicationId, Long id) {
		return MonitorResponse.from(get(applicationId, id));
	}

	@Transactional
	public MonitorResponse create(Long applicationId, MonitorRequest request) {
		MonitoredApplication application = requireApplication(applicationId);
		validate(request);
		Monitor monitor = new Monitor();
		monitor.setApplication(application);
		apply(monitor, request);
		return MonitorResponse.from(repository.save(monitor));
	}

	@Transactional
	public MonitorResponse update(Long applicationId, Long id, MonitorRequest request) {
		validate(request);
		Monitor monitor = get(applicationId, id);
		apply(monitor, request);
		return MonitorResponse.from(repository.save(monitor));
	}

	@Transactional
	public void delete(Long applicationId, Long id) {
		Monitor monitor = get(applicationId, id);
		runRepository.deleteByMonitorId(id);
		repository.delete(monitor);
	}

	private void apply(Monitor monitor, MonitorRequest request) {
		monitor.setType(request.type());
		monitor.setName(request.name().trim());
		monitor.setMethod(request.type() == MonitorType.HEALTH_CHECK && normalize(request.method(), false) == null
				? "GET" : normalize(request.method(), true));
		monitor.setUrl(normalize(request.url(), false));
		monitor.setActive(request.active() == null || request.active());
		monitor.setConfig(request.config());
	}

	private void validate(MonitorRequest request) {
		if (request.type() != MonitorType.BROWSER_JOURNEY) {
			String url = normalize(request.url(), false);
			if (url == null) {
				throw new InvalidApplicationConfigurationException("url is required for HEALTH_CHECK and API_ENDPOINT monitors");
			}
			targetPolicy.validateForRegistration(url);
			String method = request.type() == MonitorType.HEALTH_CHECK && normalize(request.method(), false) == null
					? "GET" : normalize(request.method(), true);
			if (!"GET".equals(method) && !"HEAD".equals(method)) {
				throw new InvalidApplicationConfigurationException("Only GET and HEAD monitor methods are allowed");
			}
		}
		// BROWSER_JOURNEY stores its worker contract in config; execution is intentionally not implemented.
		if (request.type() == MonitorType.BROWSER_JOURNEY && request.config() == null) {
			throw new InvalidApplicationConfigurationException("config is required for BROWSER_JOURNEY monitors");
		}
	}

	private String normalize(String value, boolean uppercase) {
		if (value == null || value.isBlank()) return null;
		return uppercase ? value.trim().toUpperCase() : value.trim();
	}

	private MonitoredApplication requireApplication(Long id) {
		return applicationRepository.findById(id).orElseThrow(() -> new ApplicationNotFoundException(id));
	}

	private Monitor get(Long applicationId, Long id) {
		Monitor monitor = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Monitor", id));
		if (!monitor.getApplication().getId().equals(applicationId)) throw new ResourceNotFoundException("Monitor", id);
		return monitor;
	}
}
