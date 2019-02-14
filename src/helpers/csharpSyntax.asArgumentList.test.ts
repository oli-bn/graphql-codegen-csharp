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
                ID: "string"
              }
        }
    }
};

test("incorrect arguments tests", () => {
    expect(asArgumentList(null, options)).toBe("");
    expect(asArgumentList(undefined, options)).toBe("");
    expect(asArgumentList([], options)).toBe("");
    expect(asArgumentList([null], options)).toBe("");
});

test("list of known primitives tests", () => {
    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: true }
    ] as Variable[], options)).toBe("int a");

    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: true },
        null,
        { name: "b", type: "Boolean", isRequired: true },
        { name: "c", type: "Date", isRequired: true },
        { name: "d", type: "String", isRequired: true }
    ] as Variable[], options)).toBe("int a, bool b, DateTime c, string d");

    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: true },
        { name: "b", type: "Boolean", isRequired: true },
        { name: "c", type: "Long", isRequired: true },
        { name: "d", type: "Float", isRequired: true },
    ] as Variable[], options)).toBe("int a, bool b, long c, float d");
});

test("list of nullable known primitives tests", () => {
    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: false }
    ] as Variable[], options)).toBe("int? a");

    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: false },
        null,
        { name: "b", type: "Boolean", isRequired: true },
        { name: "c", type: "Date", isRequired: false },
        { name: "d", type: "String", isRequired: false }
    ] as Variable[], options)).toBe("int? a, bool b, DateTime? c, string d");

    expect(asArgumentList([
        { name: "a", type: "Int", isRequired: true },
        { name: "b", type: "Boolean", isRequired: false },
        { name: "c", type: "Long", isRequired: false },
        { name: "d", type: "Float", isRequired: false },
    ] as Variable[], options)).toBe("int a, bool? b, long? c, float? d");
});

/*

test("scalar, non scalar tests", () => {
    expect(getType({ type: "exotic", isRequired: true, isScalar: true } as Variable, options)).toBe("exotic");
    expect(getType({ type: "exotic", isRequired: false, isScalar: true } as Variable, options)).toBe("exotic?");
    expect(getType({ type: "exotic", isRequired: true, isScalar: false } as Variable, options)).toBe("exotic");
    expect(getType({ type: "exotic", isRequired: false, isScalar: false } as Variable, options)).toBe("exotic");
    expect(getType({ type: "Exotic", isRequired: true, isScalar: true } as Variable, options)).toBe("Exotic");
    expect(getType({ type: "Exotic", isRequired: false, isScalar: true } as Variable, options)).toBe("Exotic?");
    expect(getType({ type: "Exotic", isRequired: true, isScalar: false } as Variable, options)).toBe("Exotic");
    expect(getType({ type: "Exotic", isRequired: false, isScalar: false } as Variable, options)).toBe("Exotic");
});

test("array tests", () => {
    expect(getType({ type: "Int", isRequired: true, isArray: true } as Variable, options)).toBe("List<int>");
    expect(getType({ type: "DateTime", isRequired: true, isArray: true } as Variable, options)).toBe("List<DateTime>");
    expect(getType({ type: "Int", isRequired: false, isArray: true } as Variable, options)).toBe("List<int?>");
    expect(getType({ type: "DateTime", isRequired: false, isArray: true } as Variable, options)).toBe("List<DateTime?>");
    expect(getType({ type: "exotic", isRequired: true, isArray: true, isScalar: true } as Variable, options)).toBe("List<exotic>");
    expect(getType({ type: "exotic", isRequired: false, isArray: true, isScalar: true } as Variable, options)).toBe("List<exotic?>");
    expect(getType({ type: "Exotic", isRequired: true, isArray: true, isScalar: true } as Variable, options)).toBe("List<Exotic>");
    expect(getType({ type: "Exotic", isRequired: false, isArray: true, isScalar: true } as Variable, options)).toBe("List<Exotic?>");
});

*/