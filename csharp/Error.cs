using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace Agoda.CodeGen.GraphQL
{
    public class Error
    {
        [JsonProperty("message")]
        public string Message { get; set; }

        [JsonProperty("locations")]
        public Location[] Locations { get; set; }

        [JsonProperty("validationErrorType")]
        public string ValidationErrorType { get; set; }

        [JsonProperty("errorType")]
        public string ErrorType { get; set; }
    }
}
