package com.sentinel.client.auth;

import com.sentinel.model.AuthType;
import com.sentinel.security.SecretResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthStrategyFactory {

	private final SecretResolver secretResolver;

	public AuthStrategy create(AuthType authType, String credentialReference) {
		AuthType effectiveAuthType = authType == null ? AuthType.NONE : authType;
		return switch (effectiveAuthType) {
			case NONE -> new NoAuthStrategy();
			case BEARER -> new BearerAuthStrategy(secretResolver.resolve(credentialReference));
		};
	}

}
