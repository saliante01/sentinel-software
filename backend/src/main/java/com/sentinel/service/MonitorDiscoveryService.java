package com.sentinel.service;

import tools.jackson.databind.JsonNode;
import com.sentinel.dto.DiscoveryCandidate;
import com.sentinel.dto.DiscoveryResponse;
import com.sentinel.exception.InvalidApplicationConfigurationException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class MonitorDiscoveryService {
	private static final Set<String> HTTP_METHODS = Set.of("get", "post", "put", "patch", "delete", "head", "options", "trace");

	public DiscoveryResponse discover(JsonNode document) {
		if (document == null || !document.isObject()) throw invalid();
		if (document.has("paths")) return openApi(document);
		if (document.path("log").path("entries").isArray()) return har(document);
		throw invalid();
	}

	private DiscoveryResponse openApi(JsonNode document) {
		List<DiscoveryCandidate> values = new ArrayList<>();
		String baseUrl = openApiBaseUrl(document);
		document.path("paths").properties().forEach(path -> path.getValue().properties().stream()
				.filter(method -> HTTP_METHODS.contains(method.getKey().toLowerCase()))
				.forEach(method -> {
					String name = method.getValue().path("summary").asText(method.getKey().toUpperCase() + " " + path.getKey());
					values.add(new DiscoveryCandidate(name, method.getKey().toUpperCase(), baseUrl + path.getKey(), "OPENAPI"));
				}));
		return new DiscoveryResponse("OPENAPI", values);
	}

	private String openApiBaseUrl(JsonNode document) {
		if (document.path("servers").isArray() && !document.path("servers").isEmpty()) return document.path("servers").get(0).path("url").asText("");
		String host = document.path("host").asText("");
		if (host.isBlank()) return "";
		String scheme = document.path("schemes").isArray() && !document.path("schemes").isEmpty() ? document.path("schemes").get(0).asText("https") : "https";
		return scheme + "://" + host + document.path("basePath").asText("");
	}

	private DiscoveryResponse har(JsonNode document) {
		List<DiscoveryCandidate> values = new ArrayList<>();
		document.path("log").path("entries").forEach(entry -> {
			JsonNode request = entry.path("request");
			String url = request.path("url").asText();
			String method = request.path("method").asText("GET").toUpperCase();
			if (!url.isBlank()) values.add(new DiscoveryCandidate(method + " " + displayPath(url), method, url, "HAR"));
		});
		return new DiscoveryResponse("HAR", values);
	}

	private String displayPath(String url) {
		try { URI uri = URI.create(url); return uri.getPath().isBlank() ? "/" : uri.getPath(); }
		catch (IllegalArgumentException exception) { return url; }
	}

	private InvalidApplicationConfigurationException invalid() {
		return new InvalidApplicationConfigurationException("Expected an OpenAPI JSON document with paths or a HAR JSON document with log.entries");
	}
}
