import { getType } from "./csharpSyntax";
import { Variable } from "graphql-codegen-core";

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
    expect(getType(null, options)).toBe("object");
    expect(getType(undefined, options)).toBe("object");
});

test("known primitives tests", () => {
    expect(getType({ type: "Int", isRequired: true } as Variable, options)).toBe("int");
    expect(getType({ type: "Boolean", isRequired: true } as Variable, options)).toBe("bool");
    expect(getType({ type: "Long", isRequired: true } as Variable, options)).toBe("long");
    expect(getType({ type: "BigDecimal", isRequired: true } as Variable, options)).toBe("decimal");
    expect(getType({ type: "URI", isRequired: true } as Variable, options)).toBe("Uri");
});

test("nullable known primitives tests", () => {
    expect(getType({ type: "Int", isRequired: false } as Variable, options)).toBe("int?");
    expect(getType({ type: "Boolean", isRequired: false } as Variable, options)).toBe("bool?");
    expect(getType({ type: "Long", isRequired: false } as Variable, options)).toBe("long?");
    expect(getType({ type: "BigDecimal", isRequired: false } as Variable, options)).toBe("decimal?");
    expect(getType({ type: "URI", isRequired: false } as Variable, options)).toBe("Uri?");
});

test("float tests", () => {
    expect(getType({ type: "Float", isRequired: true } as Variable, options)).toBe("float");
    expect(getType({ type: "Float32Bit", isRequired: true } as Variable, options)).toBe("float");
    expect(getType({ type: "Float", isRequired: false } as Variable, options)).toBe("float?");
    expect(getType({ type: "Float32Bit", isRequired: false } as Variable, options)).toBe("float?");
});

test("date tests", () => {
    expect(getType({ type: "Date", isRequired: true } as Variable, options)).toBe("DateTime");
    expect(getType({ type: "DateTime", isRequired: true } as Variable, options)).toBe("DateTime");
    expect(getType({ type: "LocalTime", isRequired: true } as Variable, options)).toBe("DateTime");
    expect(getType({ type: "Date", isRequired: false } as Variable, options)).toBe("DateTime?");
    expect(getType({ type: "DateTime", isRequired: false } as Variable, options)).toBe("DateTime?");
    expect(getType({ type: "LocalTime", isRequired: false } as Variable, options)).toBe("DateTime?");
});

test("string tests", () => {
    expect(getType({ type: "ID", isRequired: true } as Variable, options)).toBe("string");
    expect(getType({ type: "ID", isRequired: false } as Variable, options)).toBe("string");
    expect(getType({ type: "String", isRequired: true } as Variable, options)).toBe("string");
    expect(getType({ type: "String", isRequired: false } as Variable, options)).toBe("string");
});

test("scalar, non scalar tests", () => {
    expect(getType({ type: "exotic", isRequired: true, isScalar: true } as Variable, options)).toBe("Exotic");
    expect(getType({ type: "exotic", isRequired: false, isScalar: true } as Variable, options)).toBe("Exotic?");
    expect(getType({ type: "exotic", isRequired: true, isScalar: false } as Variable, options)).toBe("Exotic");
    expect(getType({ type: "exotic", isRequired: false, isScalar: false } as Variable, options)).toBe("Exotic");
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
    expect(getType({ type: "exotic", isRequired: true, isArray: true, isScalar: true } as Variable, options)).toBe("List<Exotic>");
    expect(getType({ type: "exotic", isRequired: false, isArray: true, isScalar: true } as Variable, options)).toBe("List<Exotic?>");
    expect(getType({ type: "Exotic", isRequired: true, isArray: true, isScalar: true } as Variable, options)).toBe("List<Exotic>");
    expect(getType({ type: "Exotic", isRequired: false, isArray: true, isScalar: true } as Variable, options)).toBe("List<Exotic?>");
});