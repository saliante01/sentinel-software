package com.sentinel.service;

import com.sentinel.dto.*;
import com.sentinel.exception.*;
import com.sentinel.model.*;
import com.sentinel.repository.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class IncidentService {
	private final IncidentRepository repository;
	private final MonitoredApplicationRepository applicationRepository;
	@Transactional(readOnly = true) public List<IncidentResponse> findAll(Long applicationId) {
		requireApplication(applicationId);
		return repository.findByApplicationIdOrderByStartedAtDesc(applicationId).stream().map(IncidentResponse::from).toList();
	}
	@Transactional public IncidentResponse create(Long applicationId, IncidentRequest request) {
		Incident value = new Incident(); value.setApplication(requireApplication(applicationId)); apply(value, request);
		return IncidentResponse.from(repository.save(value));
	}
	@Transactional public IncidentResponse update(Long applicationId, Long id, IncidentRequest request) {
		Incident value = get(applicationId, id); apply(value, request); return IncidentResponse.from(repository.save(value));
	}
	@Transactional public void delete(Long applicationId, Long id) { repository.delete(get(applicationId, id)); }
	private void apply(Incident value, IncidentRequest request) {
		value.setTitle(request.title().trim()); value.setDescription(request.description()); value.setStatus(request.status());
		value.setSeverity(request.severity()); value.setStartedAt(request.startedAt()); value.setResolvedAt(request.resolvedAt());
	}
	private MonitoredApplication requireApplication(Long id) { return applicationRepository.findById(id).orElseThrow(() -> new ApplicationNotFoundException(id)); }
	private Incident get(Long applicationId, Long id) {
		Incident value = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Incident", id));
		if (!value.getApplication().getId().equals(applicationId)) throw new ResourceNotFoundException("Incident", id); return value;
	}
}
