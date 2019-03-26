using Newtonsoft.Json;
using System.Collections.Generic;

namespace Agoda.CodeGen.GraphQL
{
    public abstract class QueryBase<T> : IQuery<T>
    {
        private readonly IResultProcessor<T> _resultProcessor;

        protected QueryBase(IResultProcessor<T> resultProcessor = null)
        {
            _resultProcessor = resultProcessor ?? new DefaultResultProcessor<T>();
        }

        public virtual T GetParsedObject(string jsonText, JsonSerializerSettings jsonSerializerSettings = null)
        {
            var result = JsonConvert.DeserializeObject<Result<T>>(jsonText, jsonSerializerSettings);
            return _resultProcessor.ProcessResult(result);
        }

        public virtual string GetQueryText(JsonSerializerSettings jsonSerializerSettings = null)
        {
            return JsonConvert.SerializeObject(new
            {
                query = QueryText,
                variables = Variables
            }, jsonSerializerSettings);
        }  

        protected abstract string QueryText { get; }
        protected abstract Dictionary<string, object> Variables { get; }

        string IQuery.GetQueryText(JsonSerializerSettings jsonSerializerSettings) => 
            GetQueryText(jsonSerializerSettings);
        T IQuery<T>.GetParsedObject(string jsonText, JsonSerializerSettings jsonSerializerSettings) => 
            GetParsedObject(jsonText, jsonSerializerSettings);
        object IQuery.GetParsedObject(string jsonText, JsonSerializerSettings jsonSerializerSettings) => 
            GetParsedObject(jsonText, jsonSerializerSettings);
    }
}
