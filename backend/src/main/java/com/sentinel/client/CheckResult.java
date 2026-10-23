package com.sentinel.client;

import java.time.Instant;
import tools.jackson.databind.JsonNode;

public record CheckResult(
		Instant checkedAt,
		long responseTimeMs,
		Integer httpStatus,
		boolean available,
		String errorMessage,
		JsonNode evidence) {
}
