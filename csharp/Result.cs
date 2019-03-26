using Newtonsoft.Json;

namespace Agoda.CodeGen.GraphQL
{
    public sealed class Result<T> 
    {
        [JsonProperty("data")]
        public T Data { get; set; }

        [JsonProperty("error")]
        public string Error { get; set; }

        [JsonProperty("errors")]
        public Error[] Errors { get; set; }
    }
}
