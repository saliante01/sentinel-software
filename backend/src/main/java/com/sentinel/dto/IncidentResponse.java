package com.sentinel.dto;

import com.sentinel.model.*;
import java.time.Instant;

public record IncidentResponse(Long id, Long applicationId, String title, String description,
		IncidentStatus status, IncidentSeverity severity, Instant startedAt, Instant resolvedAt, Instant createdAt) {
	public static IncidentResponse from(Incident value) {
		return new IncidentResponse(value.getId(), value.getApplication().getId(), value.getTitle(), value.getDescription(),
				value.getStatus(), value.getSeverity(), value.getStartedAt(), value.getResolvedAt(), value.getCreatedAt());
	}
}
