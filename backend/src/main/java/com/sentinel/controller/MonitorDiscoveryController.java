package com.sentinel.controller;

import tools.jackson.databind.JsonNode;
import com.sentinel.dto.DiscoveryResponse;
import com.sentinel.service.MonitorDiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController @RequestMapping("/api/monitor-discovery") @RequiredArgsConstructor
public class MonitorDiscoveryController {
	private final MonitorDiscoveryService service;
	@PostMapping public DiscoveryResponse discover(@RequestBody JsonNode document) { return service.discover(document); }
}
