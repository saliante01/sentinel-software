package com.sentinel.dto;

import com.sentinel.model.MonitoredApplication;
import java.time.Instant;

public record ApplicationResponse(Long id, String name, String url, Instant createdAt, boolean active) {

	public static ApplicationResponse from(MonitoredApplication application) {
		return new ApplicationResponse(
				application.getId(),
				application.getName(),
				application.getUrl(),
				application.getCreatedAt(),
				application.isActive());
	}

}
