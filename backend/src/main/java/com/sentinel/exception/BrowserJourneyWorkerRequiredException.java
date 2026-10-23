package com.sentinel.exception;

public class BrowserJourneyWorkerRequiredException extends RuntimeException {
	public BrowserJourneyWorkerRequiredException() {
		super("BROWSER_JOURNEY execution requires a browser worker and is not implemented by this backend");
	}
}
