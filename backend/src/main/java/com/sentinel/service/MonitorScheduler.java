package com.sentinel.service;

import com.sentinel.config.MonitoringProperties;
import com.sentinel.model.Monitor;
import com.sentinel.model.MonitorType;
import com.sentinel.repository.MonitorRepository;
import com.sentinel.repository.MonitorRunRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(prefix = "sentinel.monitoring.scheduler", name = "enabled", havingValue = "true", matchIfMissing = true)
public class MonitorScheduler {
	private static final List<MonitorType> HTTP_TYPES = List.of(MonitorType.HEALTH_CHECK, MonitorType.API_ENDPOINT);
	private final MonitorRepository monitorRepository;
	private final MonitorRunRepository runRepository;
	private final MonitorRunService runService;
	private final MonitoringProperties properties;
	private final Set<Long> running = ConcurrentHashMap.newKeySet();

	@Scheduled(fixedDelayString = "${sentinel.monitoring.scheduler.poll-interval:30s}")
	public void runDueMonitors() {
		Instant now = Instant.now();
		List<Monitor> monitors = monitorRepository.findByActiveTrueAndTypeIn(HTTP_TYPES);
		Map<Long, Instant> lastChecks = latestChecks(monitors);
		for (Monitor monitor : monitors) {
			if (!isSafeMethod(monitor) || !isDue(monitor, lastChecks.get(monitor.getId()), now, properties.getScheduler().getMinimumInterval())) continue;
			if (!running.add(monitor.getId())) continue;
			try {
				runService.runScheduled(monitor);
			} catch (RuntimeException exception) {
				log.warn("Scheduled monitor {} failed", monitor.getId(), exception);
			} finally {
				running.remove(monitor.getId());
			}
		}
	}

	private Map<Long, Instant> latestChecks(List<Monitor> monitors) {
		if (monitors.isEmpty()) return Map.of();
		List<Long> ids = monitors.stream().map(Monitor::getId).toList();
		return runRepository.findLatestCheckedAtByMonitorIds(ids).stream()
				.collect(Collectors.toMap(row -> (Long) row[0], row -> (Instant) row[1]));
	}

	static boolean isSafeMethod(Monitor monitor) {
		String method = monitor.getMethod() == null ? "GET" : monitor.getMethod().toUpperCase(Locale.ROOT);
		return method.equals("GET") || method.equals("HEAD");
	}

	static boolean isDue(Monitor monitor, Instant lastCheckedAt, Instant now, Duration minimumInterval) {
		long configured = minimumInterval.toSeconds();
		if (monitor.getConfig() != null) {
			var interval = monitor.getConfig().get("intervalSeconds");
			if (interval != null && interval.isIntegralNumber() && interval.asLong() > 0) configured = interval.asLong();
		}
		long seconds = Math.max(Math.max(1, minimumInterval.toSeconds()), configured);
		return lastCheckedAt == null || !lastCheckedAt.plusSeconds(seconds).isAfter(now);
	}
}
