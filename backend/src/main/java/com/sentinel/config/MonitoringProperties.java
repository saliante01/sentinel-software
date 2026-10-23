package com.sentinel.config;

import java.time.Duration;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "sentinel.monitoring")
public class MonitoringProperties {

	private Duration connectTimeout = Duration.ofSeconds(2);

	private Duration readTimeout = Duration.ofSeconds(5);

	private Set<String> allowedHosts = new LinkedHashSet<>();

	private boolean allowPrivateTargets = false;

	private Scheduler scheduler = new Scheduler();

	@Getter @Setter
	public static class Scheduler {
		private boolean enabled = true;
		private Duration minimumInterval = Duration.ofSeconds(60);
	}

}
