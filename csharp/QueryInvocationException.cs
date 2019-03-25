using System;

namespace Agoda.CodeGen.GraphQL
{
    public class QueryInvocationException : Exception
    {
        public QueryInvocationException(string message, Error[] errors) : base(message)
        {
            Errors = errors;
        }

        public Error[] Errors { get; }
    }
}
