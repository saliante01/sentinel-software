package com.sentinel.controller;

import com.sentinel.dto.*;
import com.sentinel.service.ServiceDependencyService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/applications/{applicationId}/dependencies") @RequiredArgsConstructor
public class ServiceDependencyController {
	private final ServiceDependencyService service;
	@GetMapping public List<ServiceDependencyResponse> findAll(@PathVariable Long applicationId) { return service.findAll(applicationId); }
	@PostMapping @ResponseStatus(HttpStatus.CREATED) public ServiceDependencyResponse create(@PathVariable Long applicationId, @Valid @RequestBody ServiceDependencyRequest request) { return service.create(applicationId, request); }
	@PutMapping("/{id}") public ServiceDependencyResponse update(@PathVariable Long applicationId, @PathVariable Long id, @Valid @RequestBody ServiceDependencyRequest request) { return service.update(applicationId, id, request); }
	@DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long applicationId, @PathVariable Long id) { service.delete(applicationId, id); }
}
