package com.sentinel.controller;

import com.sentinel.dto.IncidentResponse;
import com.sentinel.dto.MonitorResponse;
import com.sentinel.service.IncidentService;
import com.sentinel.service.MonitorService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AggregateMonitoringController {
	private final MonitorService monitorService;
	private final IncidentService incidentService;

	@GetMapping("/api/monitors")
	public List<MonitorResponse> monitors() { return monitorService.findAll(); }

	@GetMapping("/api/incidents")
	public List<IncidentResponse> incidents() { return incidentService.findAll(); }
}
