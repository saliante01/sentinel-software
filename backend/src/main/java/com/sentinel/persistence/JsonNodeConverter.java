package com.sentinel.persistence;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class JsonNodeConverter implements AttributeConverter<JsonNode, String> {

	private static final ObjectMapper MAPPER = new ObjectMapper();

	@Override
	public String convertToDatabaseColumn(JsonNode value) {
		return value == null ? null : value.toString();
	}

	@Override
	public JsonNode convertToEntityAttribute(String value) {
		if (value == null) return null;
		try {
			return MAPPER.readTree(value);
		} catch (JacksonException exception) {
			throw new IllegalArgumentException("Stored JSON is invalid", exception);
		}
	}
}
