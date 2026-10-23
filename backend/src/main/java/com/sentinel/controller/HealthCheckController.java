package com.sentinel.controller;

import com.sentinel.dto.HealthCheckResponse;
import com.sentinel.dto.PageResponse;
import com.sentinel.service.HealthCheckService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications/{applicationId}/checks")
@RequiredArgsConstructor
public class HealthCheckController {

	private final HealthCheckService service;

	@GetMapping
	public PageResponse<HealthCheckResponse> history(
			@PathVariable Long applicationId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return PageResponse.from(service.history(applicationId, page, size));
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public HealthCheckResponse check(@PathVariable Long applicationId) {
		return service.check(applicationId);
	}

}
