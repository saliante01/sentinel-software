package com.sentinel.dto;

import com.sentinel.model.ServiceDependency;
import java.time.Instant;

public record ServiceDependencyResponse(Long id, Long applicationId, String name, String url, boolean active, Instant createdAt) {
	public static ServiceDependencyResponse from(ServiceDependency value) {
		return new ServiceDependencyResponse(value.getId(), value.getApplication().getId(), value.getName(), value.getUrl(), value.isActive(), value.getCreatedAt());
	}
}
