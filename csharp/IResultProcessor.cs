namespace Agoda.CodeGen.GraphQL
{
    public interface IResultProcessor<T>
    {
        T ProcessResult(Result<T> result);
    }
}
