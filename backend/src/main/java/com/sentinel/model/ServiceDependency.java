package com.sentinel.model;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity @Table(name = "service_dependencies") @Getter @Setter @NoArgsConstructor
public class ServiceDependency {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "application_id", nullable = false)
	private MonitoredApplication application;
	@Column(nullable = false, length = 100) private String name;
	@Column(length = 2048) private String url;
	@Column(nullable = false) private boolean active = true;
	@Column(nullable = false, updatable = false) private Instant createdAt;
	@PrePersist void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
}
