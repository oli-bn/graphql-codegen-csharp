using Newtonsoft.Json;

namespace Agoda.CodeGen.GraphQL
{
    public interface IQuery
    {
        string GetQueryText(JsonSerializerSettings jsonSerializerSettings = null);
        object GetParsedObject(string jsonText, JsonSerializerSettings jsonSerializerSettings = null);
    }

    public interface IQuery<out T> : IQuery
    {
        new T GetParsedObject(string jsonText, JsonSerializerSettings jsonSerializerSettings = null);
    }
}
