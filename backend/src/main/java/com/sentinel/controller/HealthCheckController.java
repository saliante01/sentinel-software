package com.sentinel.controller;

import com.sentinel.dto.HealthCheckResponse;
import com.sentinel.service.HealthCheckService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications/{applicationId}/checks")
@RequiredArgsConstructor
public class HealthCheckController {

	private final HealthCheckService service;

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public HealthCheckResponse check(@PathVariable Long applicationId) {
		return service.check(applicationId);
	}

}
