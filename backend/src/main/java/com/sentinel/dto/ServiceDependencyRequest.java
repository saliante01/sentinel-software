package com.sentinel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ServiceDependencyRequest(@NotBlank @Size(max = 100) String name,
		@Size(max = 2048) @Pattern(regexp = "^https?://\\S+$") String url, Boolean active) {}
