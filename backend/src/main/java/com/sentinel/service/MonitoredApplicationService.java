package com.sentinel.service;

import com.sentinel.dto.ApplicationResponse;
import com.sentinel.dto.CreateApplicationRequest;
import com.sentinel.exception.ApplicationNotFoundException;
import com.sentinel.model.MonitoredApplication;
import com.sentinel.repository.MonitoredApplicationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MonitoredApplicationService {

	private final MonitoredApplicationRepository repository;

	@Transactional(readOnly = true)
	public List<ApplicationResponse> findAll() {
		return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
				.stream()
				.map(ApplicationResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public ApplicationResponse findById(Long id) {
		return ApplicationResponse.from(getOrThrow(id));
	}

	@Transactional
	public ApplicationResponse create(CreateApplicationRequest request) {
		MonitoredApplication application = new MonitoredApplication();
		application.setName(request.name().trim());
		application.setUrl(request.url().trim());
		return ApplicationResponse.from(repository.save(application));
	}

	@Transactional
	public void delete(Long id) {
		repository.delete(getOrThrow(id));
	}

	private MonitoredApplication getOrThrow(Long id) {
		return repository.findById(id)
				.orElseThrow(() -> new ApplicationNotFoundException(id));
	}

}
