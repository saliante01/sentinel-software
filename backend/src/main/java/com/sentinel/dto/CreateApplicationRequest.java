package com.sentinel.dto;

import com.sentinel.model.AuthType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateApplicationRequest(
		@NotBlank(message = "name is required")
		@Size(max = 100, message = "name must have at most 100 characters")
		String name,

		@NotBlank(message = "url is required")
		@Size(max = 2048, message = "url must have at most 2048 characters")
		@Pattern(regexp = "^https?://\\S+$", message = "url must start with http:// or https://")
		String url,

		AuthType authType,

		@Size(max = 100, message = "credentialRef must have at most 100 characters")
		String credentialRef) {
}
