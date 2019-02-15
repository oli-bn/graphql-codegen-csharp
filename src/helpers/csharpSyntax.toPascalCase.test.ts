import { toPascalCase } from "./csharpSyntax";

test("method should return a pascal cased string", () => {
    expect(toPascalCase("foo bar")).toBe("FooBar");
    expect(toPascalCase("Foo Bar")).toBe("FooBar");
    expect(toPascalCase("fooBar")).toBe("FooBar");
    expect(toPascalCase("FooBar")).toBe("FooBar");
    expect(toPascalCase("--foo-bar--")).toBe("FooBar");
    expect(toPascalCase("__FOO_BAR__")).toBe("FooBar");
    expect(toPascalCase("!--foo-¿?-bar--121-**%")).toBe("FooBar121");
});