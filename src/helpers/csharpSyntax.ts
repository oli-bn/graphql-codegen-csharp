import { SafeString } from "handlebars";
import { Variable, Type, Field } from "graphql-codegen-core";

const scalarTypeMapping : { [name: string]: string; } = {
    "Date" : "DateTime",
    "DateTime" : "DateTime",
    "Long" : "long",
    "BigDecimal" : "decimal",
    "Float": "float",
    "Float32Bit" : "float",
    "LocalTime" : "DateTime",
    "URI" : "Uri"
};

const typeConverterMapping : { [name: string]: string; } = {
    "Date" : ".ToString(\"yyyy-MM-dd\")",
};

export function toCsharpComment(text: string): SafeString {
    if(text === undefined || text === null || text === "") {
        return new SafeString("");
    }
    return new SafeString(`/// <summary>${text.replace(/\r?\n|\r/g, " ")}</sumary>`);
}

export function asQueryUnescapedText(text: string): SafeString {

    if(text) {
        return new SafeString(text.replace(/&#x3D;/g, "=").replace(/"/g, "\"\""));
    }

    return new SafeString("");
}

export function converterIfNeeded(variable: Variable): string {
    const converter: string = typeConverterMapping[variable.type];

    if(converter === undefined) {
        return "";
    }

    return converter;
}

export function asArgumentList(variables: Variable[], options: any): string {
    var list: string = "";
    for(let i: number = 0; i < variables.length; i++) {
        var variable: any = variables[i];
        var typeName: string = getType(variable, options) || "object";
        list += `${typeName} ${variable.name}`;
        if(i < variables.length - 1) {
            list += ", ";
        }
    }
    return list;
}

export function getType(type: any, options: any): string {

    if (!type) {
      return "object";
    }

    const baseType: any = type.type;
    let isValueType: boolean = type.isScalar;
    let realType: any = baseType;

    if(options.data.root.primitivesMap[baseType] !== undefined) {
        realType = options.data.root.primitivesMap[baseType];
        isValueType = realType !== "string";
    }

    if (type.isArray) {
      return `List<${realType}>`;
    } else {
        let typeName: string = scalarTypeMapping[baseType];
        if(typeName === undefined) {
            typeName = scalarTypeMapping[realType];
        }
        if(typeName === undefined) {
            typeName = realType;
        } else {
            isValueType = true;
        }

        const isNullable: boolean = isValueType === true && type.isRequired !== true;
        return isNullable === true ? `${typeName}?` : typeName;
    }
}

export function getOptionals(type: any, options: any): string {
    const config: any = options.data.root.config || {};
    if (
        config.avoidOptionals === "1" ||
        config.avoidOptionals === "true" ||
        config.avoidOptionals === true ||
        config.avoidOptionals === 1
    ) {
        return "";
    }
    if (!type.isRequired) {
        return "";
    }
    return "";
}

export function asJsonString(obj: any): string {
    if(obj === null) {
        return "null";
    }

    return JSON.stringify(obj);
}

export function isMutation(typeName: String): Boolean {
    return typeName.lastIndexOf("Mutation") > -1;
}

export function getTypesIfUsed(inputTypes: [any], classes: [any], typeName: string): any {

    const typeNameMap: { [name: string]: any; } = { };
    const usedTypes: any[] = [];

    classes.forEach(c => {
        var name: string = c.name;
        if(typeNameMap[name] === undefined) {
            typeNameMap[name] = c;
        }
    });

    inputTypes.forEach(c => {
        if(c.fields) {
            c.fields.forEach(f => {
                var type: any = typeNameMap[f.type];
                if(type !== undefined && usedTypes.indexOf(type) === -1) {
                    if(typeName === "scalars") {
                        const csharpTypeName: string = scalarTypeMapping[f.type];
                        if(csharpTypeName === undefined) {
                            usedTypes.push(type);
                        }
                    } else {
                        usedTypes.push(type);
                    }
                }
            });
        }
    });

    return usedTypes;
}