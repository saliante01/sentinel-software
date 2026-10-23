package com.sentinel.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.sentinel.model.Monitor;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class MonitorSchedulerTests {
	private final ObjectMapper mapper = new ObjectMapper();

	@Test void onlyAllowsGetAndHead() {
		Monitor monitor = new Monitor();
		monitor.setMethod("HEAD");
		assertThat(MonitorScheduler.isSafeMethod(monitor)).isTrue();
		monitor.setMethod("POST");
		assertThat(MonitorScheduler.isSafeMethod(monitor)).isFalse();
	}

	@Test void respectsConfiguredIntervalAndGlobalMinimum() throws Exception {
		Instant now = Instant.parse("2026-01-01T00:02:00Z");
		Monitor monitor = new Monitor();
		monitor.setConfig(mapper.readTree("{\"intervalSeconds\":120}"));
		assertThat(MonitorScheduler.isDue(monitor, now.minusSeconds(119), now, Duration.ofSeconds(60))).isFalse();
		assertThat(MonitorScheduler.isDue(monitor, now.minusSeconds(120), now, Duration.ofSeconds(60))).isTrue();
		monitor.setConfig(mapper.readTree("{\"intervalSeconds\":10}"));
		assertThat(MonitorScheduler.isDue(monitor, now.minusSeconds(59), now, Duration.ofSeconds(60))).isFalse();
		assertThat(MonitorScheduler.isDue(monitor, now.minusSeconds(60), now, Duration.ofSeconds(60))).isTrue();
	}
}
