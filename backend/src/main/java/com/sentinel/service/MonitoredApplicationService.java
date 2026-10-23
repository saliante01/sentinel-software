package com.sentinel.service;

import com.sentinel.dto.ApplicationResponse;
import com.sentinel.dto.CreateApplicationRequest;
import com.sentinel.exception.ApplicationNotFoundException;
import com.sentinel.exception.InvalidApplicationConfigurationException;
import com.sentinel.model.AuthType;
import com.sentinel.model.MonitoredApplication;
import com.sentinel.repository.HealthCheckRepository;
import com.sentinel.repository.MonitoredApplicationRepository;
import com.sentinel.security.AllowedTargetPolicy;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MonitoredApplicationService {

	private final MonitoredApplicationRepository repository;
	private final HealthCheckRepository healthCheckRepository;
	private final AllowedTargetPolicy targetPolicy;

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
		AuthType authType = request.authType() == null ? AuthType.NONE : request.authType();
		String credentialRef = normalize(request.credentialRef());
		validateCredentialConfiguration(authType, credentialRef);

		String url = request.url().trim();
		targetPolicy.validateForRegistration(url);

		MonitoredApplication application = new MonitoredApplication();
		application.setName(request.name().trim());
		application.setUrl(url);
		application.setAuthType(authType);
		application.setCredentialRef(credentialRef);
		return ApplicationResponse.from(repository.save(application));
	}

	@Transactional
	public void delete(Long id) {
		MonitoredApplication application = getOrThrow(id);
		healthCheckRepository.deleteByApplicationId(id);
		repository.delete(application);
	}

	private void validateCredentialConfiguration(AuthType authType, String credentialRef) {
		if (authType == AuthType.BEARER && credentialRef == null) {
			throw new InvalidApplicationConfigurationException(
					"credentialRef is required when authType is BEARER");
		}
		if (authType == AuthType.NONE && credentialRef != null) {
			throw new InvalidApplicationConfigurationException(
					"credentialRef must be empty when authType is NONE");
		}
	}

	private String normalize(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}

	private MonitoredApplication getOrThrow(Long id) {
		return repository.findById(id)
				.orElseThrow(() -> new ApplicationNotFoundException(id));
	}

}
