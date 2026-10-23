package com.sentinel.dto;

import tools.jackson.databind.JsonNode;
import com.sentinel.model.Monitor;
import com.sentinel.model.MonitorType;
import java.time.Instant;

public record MonitorResponse(Long id, Long applicationId, MonitorType type, String name,
		String method, String url, boolean active, JsonNode config, Instant createdAt) {
	public static MonitorResponse from(Monitor monitor) {
		return new MonitorResponse(monitor.getId(), monitor.getApplication().getId(), monitor.getType(),
				monitor.getName(), monitor.getMethod(), monitor.getUrl(), monitor.isActive(),
				monitor.getConfig(), monitor.getCreatedAt());
	}
}
