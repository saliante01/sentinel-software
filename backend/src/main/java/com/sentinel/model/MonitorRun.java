package com.sentinel.model;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tools.jackson.databind.JsonNode;
import com.sentinel.persistence.JsonNodeConverter;

@Entity
@Table(name = "monitor_runs", indexes = @Index(name = "idx_monitor_runs_monitor_checked", columnList = "monitor_id, checked_at"))
@Getter @Setter @NoArgsConstructor
public class MonitorRun {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "monitor_id", nullable = false)
	private Monitor monitor;
	@Column(name = "checked_at", nullable = false, updatable = false) private Instant checkedAt;
	@Column(name = "duration_ms", nullable = false) private long durationMs;
	@Column(name = "http_status") private Integer status;
	@Column(nullable = false) private boolean success;
	@Column(length = 1000) private String error;
	@Convert(converter = JsonNodeConverter.class) @Column(length = 10000) private JsonNode config;
	@Convert(converter = JsonNodeConverter.class) @Column(length = 10000) private JsonNode evidence;
}
