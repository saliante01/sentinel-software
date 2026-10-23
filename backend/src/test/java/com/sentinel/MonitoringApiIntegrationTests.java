package com.sentinel;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sentinel.model.HealthCheck;
import com.sentinel.model.MonitoredApplication;
import com.sentinel.model.Monitor;
import com.sentinel.model.MonitorRun;
import com.sentinel.model.MonitorType;
import com.sentinel.repository.HealthCheckRepository;
import com.sentinel.repository.IncidentRepository;
import com.sentinel.repository.MonitorRepository;
import com.sentinel.repository.MonitorRunRepository;
import com.sentinel.repository.MonitoredApplicationRepository;
import com.sentinel.repository.ServiceDependencyRepository;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class MonitoringApiIntegrationTests {
	@Autowired MockMvc mvc;
	@Autowired MonitoredApplicationRepository applications;
	@Autowired HealthCheckRepository checks;
	@Autowired MonitorRepository monitors;
	@Autowired MonitorRunRepository runs;
	@Autowired IncidentRepository incidents;
	@Autowired ServiceDependencyRepository dependencies;
	private Long applicationId;

	@BeforeEach
	void setUp() {
		checks.deleteAll();
		runs.deleteAll();
		monitors.deleteAll();
		incidents.deleteAll();
		dependencies.deleteAll();
		applications.deleteAll();
		MonitoredApplication application = new MonitoredApplication();
		application.setName("API");
		application.setUrl("https://example.com/health");
		application = applications.save(application);
		applicationId = application.getId();
		for (int i = 0; i < 3; i++) {
			HealthCheck check = new HealthCheck();
			check.setApplication(application);
			check.setCheckedAt(Instant.parse("2026-01-01T00:00:0" + i + "Z"));
			check.setAvailable(true);
			check.setResponseTimeMs(i);
			checks.save(check);
		}
	}

	@Test
	void rejectsBrowserJourneyAndMutableMethodWithoutNetwork() throws Exception {
		MonitoredApplication application = applications.findById(applicationId).orElseThrow();
		Monitor browser = monitor(application, MonitorType.BROWSER_JOURNEY, "GET");
		Monitor mutable = monitor(application, MonitorType.API_ENDPOINT, "POST");

		mvc.perform(post("/api/applications/{applicationId}/monitors/{id}/runs", applicationId, browser.getId()))
				.andExpect(status().isNotImplemented())
				.andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("browser worker")));
		mvc.perform(post("/api/applications/{applicationId}/monitors/{id}/runs", applicationId, mutable.getId()))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.detail").value("Only GET and HEAD monitor methods can be executed"));
	}

	@Test
	void listsPersistedRunsNewestFirst() throws Exception {
		MonitoredApplication application = applications.findById(applicationId).orElseThrow();
		Monitor monitor = monitor(application, MonitorType.HEALTH_CHECK, "GET");
		for (int i = 0; i < 2; i++) {
			MonitorRun run = new MonitorRun();
			run.setMonitor(monitor);
			run.setCheckedAt(Instant.parse("2026-02-01T00:00:0" + i + "Z"));
			run.setDurationMs(i + 10);
			run.setStatus(200);
			run.setSuccess(true);
			runs.save(run);
		}

		mvc.perform(get("/api/applications/{applicationId}/monitors/{id}/runs?size=1", applicationId, monitor.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].durationMs").value(11))
				.andExpect(jsonPath("$.totalElements").value(2));
	}

	private Monitor monitor(MonitoredApplication application, MonitorType type, String method) {
		Monitor monitor = new Monitor();
		monitor.setApplication(application);
		monitor.setType(type);
		monitor.setName(type.name());
		monitor.setMethod(method);
		monitor.setUrl("https://example.com/health");
		return monitors.save(monitor);
	}

	@Test
	void paginatesLatestChecksFirst() throws Exception {
		mvc.perform(get("/api/applications/{id}/checks?page=0&size=2", applicationId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()").value(2))
				.andExpect(jsonPath("$.content[0].responseTimeMs").value(2))
				.andExpect(jsonPath("$.totalElements").value(3));
	}

	@Test
	void createsAndListsMonitorWithJsonConfig() throws Exception {
		mvc.perform(post("/api/applications/{id}/monitors", applicationId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"type":"API_ENDPOINT","name":"List users","method":"get",
						 "url":"https://example.com/users","config":{"expectedStatus":200}}
						"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.method").value("GET"))
				.andExpect(jsonPath("$.config.expectedStatus").value(200));

		mvc.perform(get("/api/applications/{id}/monitors", applicationId))
				.andExpect(status().isOk()).andExpect(jsonPath("$[0].name").value("List users"));
	}
}
