using System;
using Newtonsoft.Json;

/// <summary>
/// A JSON converter that converts empty strings to null values.
/// </summary>
/// /// <example>
/// <code>
/// [JsonConverter(typeof(EmptyStringToNullConverter))]
/// public string? SomeProperty { get; set; }
/// </code>
/// </example>
public class EmptyStringToNullConverter : JsonConverter
{
    public override bool CanConvert(Type objectType)
    {
        return objectType == typeof(string);
    }

    public override object? ReadJson(
        JsonReader reader,
        Type objectType,
        object? existingValue,
        JsonSerializer serializer
    )
    {
        var value = reader.Value as string;
        return string.IsNullOrWhiteSpace(value) ? null : value;
    }

    public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
    {
        var stringValue = value as string;
        if (string.IsNullOrWhiteSpace(stringValue))
        {
            writer.WriteNull();
        }
        else
        {
            writer.WriteValue(stringValue);
        }
    }
}
