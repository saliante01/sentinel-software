package com.sentinel.client.auth;

import org.springframework.http.HttpHeaders;

public class BearerAuthStrategy implements AuthStrategy {

	private final String token;

	public BearerAuthStrategy(String token) {
		this.token = token;
	}

	@Override
	public void apply(HttpHeaders headers) {
		headers.setBearerAuth(token);
	}

}
