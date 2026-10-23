package com.sentinel.client.auth;

import org.springframework.http.HttpHeaders;

public interface AuthStrategy {

	void apply(HttpHeaders headers);

}
