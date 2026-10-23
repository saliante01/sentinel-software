package com.sentinel.dto;

import com.sentinel.model.IncidentSeverity;
import com.sentinel.model.IncidentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record IncidentRequest(@NotBlank @Size(max = 200) String title, @Size(max = 4000) String description,
		@NotNull IncidentStatus status, @NotNull IncidentSeverity severity, Instant startedAt, Instant resolvedAt) {}
