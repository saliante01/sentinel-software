package com.sentinel.controller;

import com.sentinel.dto.*;
import com.sentinel.service.IncidentService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/applications/{applicationId}/incidents") @RequiredArgsConstructor
public class IncidentController {
	private final IncidentService service;
	@GetMapping public List<IncidentResponse> findAll(@PathVariable Long applicationId) { return service.findAll(applicationId); }
	@PostMapping @ResponseStatus(HttpStatus.CREATED) public IncidentResponse create(@PathVariable Long applicationId, @Valid @RequestBody IncidentRequest request) { return service.create(applicationId, request); }
	@PutMapping("/{id}") public IncidentResponse update(@PathVariable Long applicationId, @PathVariable Long id, @Valid @RequestBody IncidentRequest request) { return service.update(applicationId, id, request); }
	@DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long applicationId, @PathVariable Long id) { service.delete(applicationId, id); }
}
