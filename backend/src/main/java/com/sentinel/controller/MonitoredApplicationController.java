package com.sentinel.controller;

import com.sentinel.dto.ApplicationResponse;
import com.sentinel.dto.CreateApplicationRequest;
import com.sentinel.service.MonitoredApplicationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class MonitoredApplicationController {

	private final MonitoredApplicationService service;

	@GetMapping
	public List<ApplicationResponse> findAll() {
		return service.findAll();
	}

	@GetMapping("/{id}")
	public ApplicationResponse findById(@PathVariable Long id) {
		return service.findById(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ApplicationResponse create(@Valid @RequestBody CreateApplicationRequest request) {
		return service.create(request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long id) {
		service.delete(id);
	}

}
