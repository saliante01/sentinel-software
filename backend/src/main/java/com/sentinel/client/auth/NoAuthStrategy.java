package com.sentinel.client.auth;

import org.springframework.http.HttpHeaders;

public class NoAuthStrategy implements AuthStrategy {

	@Override
	public void apply(HttpHeaders headers) {
	}

}
