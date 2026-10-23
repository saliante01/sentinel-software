package com.sentinel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "health_checks", indexes = {
		@Index(name = "idx_health_checks_application_checked", columnList = "application_id, checked_at")
})
@Getter
@Setter
@NoArgsConstructor
public class HealthCheck {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "application_id", nullable = false)
	private MonitoredApplication application;

	@Column(name = "checked_at", nullable = false, updatable = false)
	private Instant checkedAt;

	@Column(name = "response_time_ms", nullable = false)
	private long responseTimeMs;

	@Column(name = "http_status")
	private Integer httpStatus;

	@Column(nullable = false)
	private boolean available;

	@Column(name = "error_message", length = 1000)
	private String errorMessage;

}
