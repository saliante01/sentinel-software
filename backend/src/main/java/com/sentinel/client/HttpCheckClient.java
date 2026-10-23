package com.sentinel.client;

import com.sentinel.client.auth.AuthStrategy;
import com.sentinel.client.auth.AuthStrategyFactory;
import com.sentinel.exception.InvalidTargetException;
import com.sentinel.exception.MissingCredentialException;
import com.sentinel.model.MonitoredApplication;
import com.sentinel.security.AllowedTargetPolicy;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

@Component
@RequiredArgsConstructor
public class HttpCheckClient {

	private static final int MAX_ERROR_MESSAGE_LENGTH = 1000;
	private static final List<String> SAFE_RESPONSE_HEADERS = List.of(
			"Cache-Control", "Content-Length", "ETag", "Last-Modified");

	private final RestClient monitoringRestClient;
	private final AllowedTargetPolicy targetPolicy;
	private final AuthStrategyFactory authStrategyFactory;
	private final ObjectMapper objectMapper;

	public CheckResult check(MonitoredApplication application) {
		return check(application, application.getUrl(), HttpMethod.GET);
	}

	public CheckResult check(MonitoredApplication application, String url, HttpMethod method) {
		Instant checkedAt = Instant.now();
		long startedAt = System.nanoTime();

		try {
			targetPolicy.validateForCheck(url);
			AuthStrategy authStrategy = authStrategyFactory.create(
					application.getAuthType(),
					application.getCredentialRef());

			HttpResponse response = monitoringRestClient.method(method)
					.uri(url)
					.headers(authStrategy::apply)
					.exchange((request, clientResponse) -> {
						Map<String, String> headers = new LinkedHashMap<>();
						SAFE_RESPONSE_HEADERS.forEach(name -> {
							String value = clientResponse.getHeaders().getFirst(name);
							if (value != null) headers.put(name, value);
						});
						String contentType = clientResponse.getHeaders().getContentType() == null ? null
								: clientResponse.getHeaders().getContentType().toString();
						return new HttpResponse(clientResponse.getStatusCode().value(), contentType, headers);
					});

			long responseTimeMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt);
			boolean available = response.status() >= 200 && response.status() < 300;
			Map<String, Object> evidence = new LinkedHashMap<>();
			if (response.contentType() != null) evidence.put("contentType", response.contentType());
			if (!response.headers().isEmpty()) evidence.put("headers", response.headers());

			return new CheckResult(checkedAt, responseTimeMs, response.status(), available,
					messageForStatus(response.status()), objectMapper.valueToTree(evidence));
		} catch (MissingCredentialException exception) {
			return failure(checkedAt, startedAt, exception.getMessage());
		} catch (InvalidTargetException exception) {
			return failure(checkedAt, startedAt, exception.getMessage());
		} catch (Exception exception) {
			return failure(checkedAt, startedAt, describe(exception));
		}
	}

	private CheckResult failure(Instant checkedAt, long startedAt, String errorMessage) {
		long responseTimeMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt);
		return new CheckResult(checkedAt, responseTimeMs, null, false, truncate(errorMessage), null);
	}

	private String messageForStatus(int httpStatus) {
		if (httpStatus == 401) {
			return "Unauthorized: missing or invalid credentials";
		}
		if (httpStatus == 403) {
			return "Forbidden: credentials lack the required role";
		}
		if (httpStatus >= 300 && httpStatus < 400) {
			return "Redirect received but redirects are not followed";
		}
		if (httpStatus >= 400) {
			return "HTTP request failed with status " + httpStatus;
		}
		return null;
	}

	private String describe(Throwable exception) {
		Throwable rootCause = exception;
		while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
			rootCause = rootCause.getCause();
		}

		String message = rootCause.getMessage();
		String description = message == null || message.isBlank()
				? rootCause.getClass().getSimpleName()
				: rootCause.getClass().getSimpleName() + ": " + message;
		return truncate(description);
	}

	private String truncate(String message) {
		if (message == null || message.length() <= MAX_ERROR_MESSAGE_LENGTH) {
			return message;
		}
		return message.substring(0, MAX_ERROR_MESSAGE_LENGTH);
	}

	private record HttpResponse(int status, String contentType, Map<String, String> headers) {}

}
