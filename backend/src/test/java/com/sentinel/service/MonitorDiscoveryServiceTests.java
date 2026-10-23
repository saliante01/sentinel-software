package com.sentinel.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.sentinel.dto.DiscoveryResponse;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class MonitorDiscoveryServiceTests {
	private final ObjectMapper mapper = new ObjectMapper();
	private final MonitorDiscoveryService service = new MonitorDiscoveryService();

	@Test
	void discoversOpenApiOperations() throws Exception {
		DiscoveryResponse response = service.discover(mapper.readTree("""
				{"openapi":"3.0.0","servers":[{"url":"https://api.example.com"}],
				 "paths":{"/users":{"get":{"summary":"List users"},"post":{}}}}
				"""));

		assertThat(response.format()).isEqualTo("OPENAPI");
		assertThat(response.candidates()).extracting("method").containsExactly("GET", "POST");
		assertThat(response.candidates().getFirst().url()).isEqualTo("https://api.example.com/users");
	}

	@Test
	void discoversHarRequests() throws Exception {
		DiscoveryResponse response = service.discover(mapper.readTree("""
				{"log":{"entries":[{"request":{"method":"post","url":"https://api.example.com/orders?draft=true"}}]}}
				"""));

		assertThat(response.format()).isEqualTo("HAR");
		assertThat(response.candidates()).hasSize(1);
		assertThat(response.candidates().getFirst().name()).isEqualTo("POST /orders");
	}
}
