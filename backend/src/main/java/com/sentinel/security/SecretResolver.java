package com.sentinel.security;

import com.sentinel.exception.MissingCredentialException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecretResolver {

	private final Environment environment;

	public String resolve(String credentialReference) {
		if (credentialReference == null || credentialReference.isBlank()) {
			throw new MissingCredentialException(credentialReference);
		}

		String secret = environment.getProperty(credentialReference);
		if (secret == null || secret.isBlank()) {
			throw new MissingCredentialException(credentialReference);
		}

		return secret;
	}

}
