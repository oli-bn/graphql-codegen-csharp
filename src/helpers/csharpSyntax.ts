import { SafeString } from "handlebars";
import { Variable, Type, Field } from "graphql-codegen-core";

export function eq(text: any, otherText: any): boolean {
    return text === otherText;
}

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

const scalarTypeMapping : { [name: string]: string; } = {
    "Long" : "long",
    "BigDecimal" : "decimal",
    "Float32Bit" : "float",
    "LocalTime" : "DateTime",
    "URI" : "Uri",
};

export function getType(type: any, options: any): string {
    if (!type) {
      return "object";
    }

    const baseType: any = type.type;
    const realType: any = options.data.root.primitivesMap[baseType] || baseType;
    if (type.isArray) {
      return `List<${realType}>`;
    } else {
        var typeName: string = scalarTypeMapping[realType];

        if(typeName !== undefined) {
            return typeName;
        }

        if((type.isEnum || type.isScalar) && type.isRequired === false && realType !== "string") {
            return `${realType}?`;
        }

        return realType;
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
                        if(scalarTypeMapping[typeName] === undefined) {
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