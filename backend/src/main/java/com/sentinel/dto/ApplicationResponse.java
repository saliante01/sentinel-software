package com.sentinel.dto;

import com.sentinel.model.AuthType;
import com.sentinel.model.MonitoredApplication;
import java.time.Instant;

public record ApplicationResponse(
		Long id,
		String name,
		String url,
		Instant createdAt,
		boolean active,
		AuthType authType,
		boolean credentialConfigured) {

	public static ApplicationResponse from(MonitoredApplication application) {
		AuthType authType = application.getAuthType() == null ? AuthType.NONE : application.getAuthType();
		boolean credentialConfigured = application.getCredentialRef() != null
				&& !application.getCredentialRef().isBlank();

		return new ApplicationResponse(
				application.getId(),
				application.getName(),
				application.getUrl(),
				application.getCreatedAt(),
				application.isActive(),
				authType,
				credentialConfigured);
	}

}
