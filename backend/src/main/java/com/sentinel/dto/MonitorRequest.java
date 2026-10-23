package com.sentinel.dto;

import tools.jackson.databind.JsonNode;
import com.sentinel.model.MonitorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MonitorRequest(
		@NotNull MonitorType type,
		@NotBlank @Size(max = 100) String name,
		@Size(max = 10) String method,
		@Size(max = 2048) String url,
		Boolean active,
		JsonNode config) {
}
