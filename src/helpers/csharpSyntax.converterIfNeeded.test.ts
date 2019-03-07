import { converterIfNeeded } from "./csharpSyntax";
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

test("non date tests", () => {
    expect(converterIfNeeded(null, options)).toBe("");
    expect(converterIfNeeded(undefined, options)).toBe("");
});

test("known primitives tests", () => {

    ["Int", "Boolean", "Long", "BigDecimal", "URI", "Float", "Float32Bit" ].forEach(t => {
        expect(converterIfNeeded({ type: t, isRequired: true } as Variable, options)).toBe("");
        expect(converterIfNeeded({ type: t, isRequired: false } as Variable, options)).toBe("");
    });
});

test("date tests", () => {
    expect(converterIfNeeded({ type: "Date", isRequired: true } as Variable, options)).toBe(".ToString(\"yyyy-MM-dd\")");
    expect(converterIfNeeded({ type: "DateTime", isRequired: true } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "LocalTime", isRequired: true } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "Date", isRequired: false } as Variable, options)).toBe("?.ToString(\"yyyy-MM-dd\")");
    expect(converterIfNeeded({ type: "DateTime", isRequired: false } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "LocalTime", isRequired: false } as Variable, options)).toBe("");
});

test("string tests", () => {
    expect(converterIfNeeded({ type: "ID", isRequired: true } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "ID", isRequired: false } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "String", isRequired: true } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "String", isRequired: false } as Variable, options)).toBe("");
});

test("scalar, non scalar tests", () => {
    expect(converterIfNeeded({ type: "Exotic", isRequired: true, isScalar: true } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "Exotic", isRequired: false, isScalar: true } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "Exotic", isRequired: true, isScalar: false } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "Exotic", isRequired: false, isScalar: false } as Variable, options)).toBe("");
});

test("array tests", () => {
    expect(converterIfNeeded({ type: "Int", isRequired: true, isArray: true } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "DateTime", isRequired: true, isArray: true } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "Int", isRequired: false, isArray: true } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "DateTime", isRequired: false, isArray: true } as Variable, options)).toBe("");
    expect(converterIfNeeded({ type: "Exotic", isRequired: true, isArray: true, isScalar: true } as Variable, options))
        .toBe("");
    expect(converterIfNeeded({ type: "Exotic", isRequired: false, isArray: true, isScalar: true } as Variable, options))
        .toBe("");
});