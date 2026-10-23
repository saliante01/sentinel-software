package com.sentinel.client;

import java.time.Instant;

public record CheckResult(
		Instant checkedAt,
		long responseTimeMs,
		Integer httpStatus,
		boolean available,
		String errorMessage) {
}
