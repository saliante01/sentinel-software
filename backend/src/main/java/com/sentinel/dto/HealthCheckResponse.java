package com.sentinel.dto;

import com.sentinel.model.HealthCheck;
import java.time.Instant;

public record HealthCheckResponse(
		Long id,
		Long applicationId,
		Instant checkedAt,
		long responseTimeMs,
		Integer httpStatus,
		boolean available,
		String errorMessage) {

	public static HealthCheckResponse from(HealthCheck healthCheck) {
		return new HealthCheckResponse(
				healthCheck.getId(),
				healthCheck.getApplication().getId(),
				healthCheck.getCheckedAt(),
				healthCheck.getResponseTimeMs(),
				healthCheck.getHttpStatus(),
				healthCheck.isAvailable(),
				healthCheck.getErrorMessage());
	}

}
