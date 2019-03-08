// tslint:disable-next-line:typedef
import * as pascalcase from "pascalcase";

test("method should return a pascal cased string", () => {
    expect(pascalcase("foo bar")).toBe("FooBar");
    expect(pascalcase("Foo Bar")).toBe("FooBar");
    expect(pascalcase("fooBar")).toBe("FooBar");
    expect(pascalcase("FooBar")).toBe("FooBar");
    expect(pascalcase("--foo-bar--")).toBe("FooBar");
    expect(pascalcase("__FOO_BAR__")).toBe("FOOBAR");
    expect(pascalcase("!--foo-¿?-bar--121-**%")).toBe("FooBar121");
});