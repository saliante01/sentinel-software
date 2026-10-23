package com.sentinel.model;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity @Table(name = "incidents") @Getter @Setter @NoArgsConstructor
public class Incident {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "application_id", nullable = false)
	private MonitoredApplication application;
	@Column(nullable = false, length = 200) private String title;
	@Column(length = 4000) private String description;
	@Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private IncidentStatus status;
	@Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private IncidentSeverity severity;
	@Column(nullable = false) private Instant startedAt;
	private Instant resolvedAt;
	@Column(nullable = false, updatable = false) private Instant createdAt;
	@PrePersist void onCreate() { if (createdAt == null) createdAt = Instant.now(); if (startedAt == null) startedAt = createdAt; }
}
