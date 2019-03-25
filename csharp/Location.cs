using Newtonsoft.Json;

namespace Agoda.CodeGen.GraphQL
{
    public class Location 
    {
        [JsonProperty("line")]
        public int? Line { get; set; }

        [JsonProperty("column")]
        public int? Column { get; set; }
    }
}
