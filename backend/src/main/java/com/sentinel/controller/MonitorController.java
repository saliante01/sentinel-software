package com.sentinel.controller;

import com.sentinel.dto.MonitorRequest;
import com.sentinel.dto.MonitorResponse;
import com.sentinel.dto.MonitorRunResponse;
import com.sentinel.dto.PageResponse;
import com.sentinel.service.MonitorService;
import com.sentinel.service.MonitorRunService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications/{applicationId}/monitors")
@RequiredArgsConstructor
public class MonitorController {
	private final MonitorService service;
	private final MonitorRunService runService;
	@GetMapping public List<MonitorResponse> findAll(@PathVariable Long applicationId) { return service.findAll(applicationId); }
	@GetMapping("/{id}") public MonitorResponse findById(@PathVariable Long applicationId, @PathVariable Long id) { return service.findById(applicationId, id); }
	@PostMapping @ResponseStatus(HttpStatus.CREATED)
	public MonitorResponse create(@PathVariable Long applicationId, @Valid @RequestBody MonitorRequest request) { return service.create(applicationId, request); }
	@PutMapping("/{id}") public MonitorResponse update(@PathVariable Long applicationId, @PathVariable Long id, @Valid @RequestBody MonitorRequest request) { return service.update(applicationId, id, request); }
	@DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long applicationId, @PathVariable Long id) { service.delete(applicationId, id); }
	@PostMapping("/{id}/runs") @ResponseStatus(HttpStatus.CREATED)
	public MonitorRunResponse run(@PathVariable Long applicationId, @PathVariable Long id) {
		return runService.run(applicationId, id);
	}
	@GetMapping("/{id}/runs")
	public PageResponse<MonitorRunResponse> runs(@PathVariable Long applicationId, @PathVariable Long id,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
		return PageResponse.from(runService.findAll(applicationId, id, page, size));
	}
}
