package com.sentinel.dto;

import com.sentinel.model.AuthType;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateApplicationRequest(
		@Size(min = 1, max = 100) String name,
		@Size(max = 2048) @Pattern(regexp = "^https?://\\S+$") String url,
		Boolean active,
		AuthType authType,
		@Size(max = 100) String credentialRef) {
}
