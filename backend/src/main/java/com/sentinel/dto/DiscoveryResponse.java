package com.sentinel.dto;

import java.util.List;

public record DiscoveryResponse(String format, List<DiscoveryCandidate> candidates) {}
