package com.sentinel.exception;

public class MissingCredentialException extends RuntimeException {

	private final String credentialReference;

	public MissingCredentialException(String credentialReference) {
		super("Credential reference '" + credentialReference + "' is not configured");
		this.credentialReference = credentialReference;
	}

	public String getCredentialReference() {
		return credentialReference;
	}

}
