namespace Agoda.CodeGen.GraphQL
{
    public class DefaultResultProcessor<T> : IResultProcessor<T>
    {
        public T ProcessResult(Result<T> result)
        {
            if (result.Error != null || result.Errors != null)
            {
                throw new QueryInvocationException(result.Error ?? "Query Invocation Error", result.Errors ?? new Error[0]);
            }

            return result.Data;
        }
    }
}
