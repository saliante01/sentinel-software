package com.sentinel.dto;

import com.sentinel.model.MonitorRun;
import java.time.Instant;
import tools.jackson.databind.JsonNode;

public record MonitorRunResponse(Long id, Long monitorId, Instant checkedAt, long durationMs,
		Integer status, boolean success, String error, JsonNode config, JsonNode evidence) {
	public static MonitorRunResponse from(MonitorRun value) {
		return new MonitorRunResponse(value.getId(), value.getMonitor().getId(), value.getCheckedAt(),
				value.getDurationMs(), value.getStatus(), value.isSuccess(), value.getError(),
				value.getConfig(), value.getEvidence());
	}
}
