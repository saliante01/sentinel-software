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
public class ServiceDependencyService {
	private final ServiceDependencyRepository repository; private final MonitoredApplicationRepository applicationRepository;
	@Transactional(readOnly = true) public List<ServiceDependencyResponse> findAll(Long applicationId) {
		requireApplication(applicationId); return repository.findByApplicationIdOrderByNameAsc(applicationId).stream().map(ServiceDependencyResponse::from).toList();
	}
	@Transactional public ServiceDependencyResponse create(Long applicationId, ServiceDependencyRequest request) {
		ServiceDependency value = new ServiceDependency(); value.setApplication(requireApplication(applicationId)); apply(value, request); return ServiceDependencyResponse.from(repository.save(value));
	}
	@Transactional public ServiceDependencyResponse update(Long applicationId, Long id, ServiceDependencyRequest request) {
		ServiceDependency value = get(applicationId, id); apply(value, request); return ServiceDependencyResponse.from(repository.save(value));
	}
	@Transactional public void delete(Long applicationId, Long id) { repository.delete(get(applicationId, id)); }
	private void apply(ServiceDependency value, ServiceDependencyRequest request) { value.setName(request.name().trim()); value.setUrl(request.url() == null ? null : request.url().trim()); value.setActive(request.active() == null || request.active()); }
	private MonitoredApplication requireApplication(Long id) { return applicationRepository.findById(id).orElseThrow(() -> new ApplicationNotFoundException(id)); }
	private ServiceDependency get(Long applicationId, Long id) { ServiceDependency value = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Service dependency", id)); if (!value.getApplication().getId().equals(applicationId)) throw new ResourceNotFoundException("Service dependency", id); return value; }
}
