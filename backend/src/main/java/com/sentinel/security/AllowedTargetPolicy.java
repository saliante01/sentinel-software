package com.sentinel.security;

import com.sentinel.config.MonitoringProperties;
import com.sentinel.exception.InvalidTargetException;
import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AllowedTargetPolicy {

	private final MonitoringProperties properties;

	public void validateForRegistration(String url) {
		validate(url, false);
	}

	public void validateForCheck(String url) {
		validate(url, true);
	}

	private void validate(String rawUrl, boolean requireDnsResolution) {
		URI uri;
		try {
			uri = URI.create(rawUrl);
		} catch (IllegalArgumentException exception) {
			throw new InvalidTargetException("Invalid URL");
		}

		String scheme = uri.getScheme();
		if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
			throw new InvalidTargetException("Only http and https targets are allowed");
		}

		if (uri.getUserInfo() != null) {
			throw new InvalidTargetException("URLs containing embedded credentials are not allowed");
		}

		String host = uri.getHost();
		if (host == null || host.isBlank()) {
			throw new InvalidTargetException("URL host is required");
		}

		String normalizedHost = normalizeHost(host);
		Set<String> allowedHosts = properties.getAllowedHosts();
		if (allowedHosts != null && !allowedHosts.isEmpty()
				&& allowedHosts.stream().map(this::normalizeHost).noneMatch(normalizedHost::equals)) {
			throw new InvalidTargetException("Host '" + host + "' is not in the allowed hosts list");
		}

		if (properties.isAllowPrivateTargets()) {
			return;
		}

		try {
			InetAddress[] addresses = InetAddress.getAllByName(host);
			for (InetAddress address : addresses) {
				if (isBlocked(address)) {
					throw new InvalidTargetException(
							"Target '" + host + "' resolves to a blocked address: " + address.getHostAddress());
				}
			}
		} catch (UnknownHostException exception) {
			if (requireDnsResolution) {
				throw new InvalidTargetException("Target host '" + host + "' could not be resolved");
			}
		}
	}

	private String normalizeHost(String host) {
		String normalized = host.toLowerCase(Locale.ROOT);
		return normalized.endsWith(".") ? normalized.substring(0, normalized.length() - 1) : normalized;
	}

	private boolean isBlocked(InetAddress address) {
		if (address.isAnyLocalAddress()
				|| address.isLoopbackAddress()
				|| address.isLinkLocalAddress()
				|| address.isSiteLocalAddress()
				|| address.isMulticastAddress()) {
			return true;
		}

		byte[] bytes = address.getAddress();
		if (address instanceof Inet4Address) {
			int first = bytes[0] & 0xff;
			int second = bytes[1] & 0xff;
			return first == 0 || (first == 100 && second >= 64 && second <= 127);
		}

		if (address instanceof Inet6Address) {
			return (bytes[0] & 0xfe) == 0xfc;
		}

		return false;
	}

}
