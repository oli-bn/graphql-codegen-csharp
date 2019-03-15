import { asArgumentList } from "./csharpSyntax";
import { Variable, Type, Field } from "graphql-codegen-core";

const options: any = {
    data: {
        root: {
            primitivesMap: {
                String: "string",
                Int: "int",
                Float: "float",
                Boolean: "bool",
                ID: "string",
              }
        }
    }
};

test("incorrect arguments tests", () => {
    expect(asArgumentList(null, options)).toBe("IResultProcessor<Data> resultProcessor = null");
    expect(asArgumentList(undefined, options)).toBe("IResultProcessor<Data> resultProcessor = null");
    expect(asArgumentList([], options)).toBe("IResultProcessor<Data> resultProcessor = null");
    expect(asArgumentList([null], options)).toBe("IResultProcessor<Data> resultProcessor = null");
});

test("list of known primitives tests", () => {
    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: true }
    ] as Variable[], options)).toBe("int a, IResultProcessor<Data> resultProcessor = null");

    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: true },
        null,
        { name: "b", type: "Boolean", isRequired: true },
        { name: "c", type: "Date", isRequired: true },
        { name: "d", type: "String", isRequired: true }
    ] as Variable[], options)).toBe("int a, bool b, DateTime c, string d, IResultProcessor<Data> resultProcessor = null");

    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: true },
        { name: "b", type: "Boolean", isRequired: true },
        { name: "c", type: "Long", isRequired: true },
        { name: "d", type: "Float", isRequired: true },
    ] as Variable[], options)).toBe("int a, bool b, long c, float d, IResultProcessor<Data> resultProcessor = null");
});

test("list of nullable known primitives tests", () => {
    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: false }
    ] as Variable[], options)).toBe("int? a, IResultProcessor<Data> resultProcessor = null");

    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: false },
        null,
        { name: "b", type: "Boolean", isRequired: true },
        { name: "c", type: "Date", isRequired: false },
        { name: "d", type: "String", isRequired: false }
    ] as Variable[], options)).toBe("int? a, bool b, DateTime? c, string d, IResultProcessor<Data> resultProcessor = null");

    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: true },
        { name: "b", type: "Boolean", isRequired: false },
        { name: "c", type: "Long", isRequired: false },
        { name: "d", type: "Float", isRequired: false },
    ] as Variable[], options)).toBe("int a, bool? b, long? c, float? d, IResultProcessor<Data> resultProcessor = null");
});

test("list of scalar, non scalar tests", () => {
    expect(asArgumentList([
        { name: "a", type: "exotic", isRequired: true, isScalar: true }
    ] as Variable[], options)).toBe("Exotic a, IResultProcessor<Data> resultProcessor = null");

    expect(asArgumentList([
        { name: "a", type: "exotic", isRequired: false, isScalar: true },
        { name: "b", type: "blah", isRequired: false, isScalar: false },
        { name: "c", type: "Blah", isRequired: false, isScalar: false },
        { name: "d", type: "Exotic", isRequired: false, isScalar: true },
    ] as Variable[], options)).toBe("Exotic? a, Blah b, Blah c, Exotic? d, IResultProcessor<Data> resultProcessor = null");
});

test("list of array tests", () => {
    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: true, isArray: true },
    ] as Variable[], options)).toBe("List<int> a, IResultProcessor<Data> resultProcessor = null");

    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: false, isArray: true },
        { name: "b", type: "DateTime", isRequired: true, isArray: true },
        { name: "c", type: "Exotic", isRequired: true, isArray: true, isScalar: true },
        { name: "d", type: "Exotic", isRequired: false, isArray: true, isScalar: true },
    ] as Variable[], options))
    .toBe("List<int?> a, List<DateTime> b, List<Exotic> c, List<Exotic?> d, IResultProcessor<Data> resultProcessor = null");
});