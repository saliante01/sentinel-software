package com.sentinel.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.sentinel.model.Monitor;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class MonitorRunServiceTests {
	private final ObjectMapper mapper = new ObjectMapper();

	@Test void acceptsConfiguredSingleStatus() throws Exception {
		Monitor monitor = monitor("{\"expectedStatus\":401}");
		assertThat(MonitorRunService.isExpectedStatus(monitor, 401)).isTrue();
		assertThat(MonitorRunService.isExpectedStatus(monitor, 200)).isFalse();
	}

	@Test void acceptsAnyConfiguredStatusInArray() throws Exception {
		Monitor monitor = monitor("{\"expectedStatuses\":[401,503]}");
		assertThat(MonitorRunService.isExpectedStatus(monitor, 503)).isTrue();
		assertThat(MonitorRunService.isExpectedStatus(monitor, 500)).isFalse();
	}

	@Test void defaultsToTwoHundreds() {
		Monitor monitor = new Monitor();
		assertThat(MonitorRunService.isExpectedStatus(monitor, 204)).isTrue();
		assertThat(MonitorRunService.isExpectedStatus(monitor, 503)).isFalse();
		assertThat(MonitorRunService.isExpectedStatus(monitor, null)).isFalse();
	}

	private Monitor monitor(String config) throws Exception {
		Monitor monitor = new Monitor();
		monitor.setConfig(mapper.readTree(config));
		return monitor;
	}
}
