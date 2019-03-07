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

export function toPascalCase(text: string): string {
    return `${text}`
    .replace(new RegExp(/[-_]+/, "g"), " ")
    .replace(new RegExp(/[^\w\s]/, "g"), "")
    .replace(
        new RegExp(/\s+(.)(\w+)/, "g"),
        ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
        )
        .replace(new RegExp(/\s/, "g"), "")
        .replace(new RegExp(/\w/), s => s.toUpperCase());
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
    variables = (variables ? variables : []).filter(v => v !== null );

    if(variables.length === 0) {
        return "IResultProcessor<Data> resultProcessor = null";
    }
    for(let i: number = 0; i < variables.length; i++) {
        var variable: Variable = variables[i];
        var typeName: string = getType(variable, options) || "object";
        list += `${typeName} ${variable.name}`;
        if(i < variables.length - 1) {
            list += ", ";
        }
    }

    list += ", IResultProcessor<Data> resultProcessor = null";

    return list;
}

interface ITypeInfo {
    name: string;
    isNullable: boolean;
    isPascalCase: boolean;
    isValueType: boolean;
    isArray: boolean;
}

function getTypeInfo(type: any, options: any): ITypeInfo {

    if (!type) {
      return null;
    }

    const baseType: any = type.type;
    let isValueType: boolean = type.isScalar;
    let realType: any = baseType;
	let isPascalCase: boolean = true;

    if(options.data.root.primitivesMap[baseType] !== undefined) {
        realType = options.data.root.primitivesMap[baseType];
        isValueType = realType !== "string";
		isPascalCase = false;
    }

	let typeName: string = scalarTypeMapping[baseType];
	if(typeName === undefined) {
        typeName = scalarTypeMapping[realType];
    }
	if(typeName === undefined) {
		typeName = realType;
	} else {
        isValueType = true;
        isPascalCase = false;
    }

    return {
        name: typeName,
        isNullable: isValueType === true && type.isRequired !== true,
        isPascalCase: isPascalCase,
        isValueType: isValueType,
        isArray: type.isArray
    } as ITypeInfo;
}

export function converterIfNeeded(variable: Variable, options: any): string {

    if(!variable) {
        return "";
    }

    const typeInfo: ITypeInfo = getTypeInfo(variable, options);
    const converter: string = typeConverterMapping[variable.type];

    if(converter === undefined) {
        return "";
    }

    return typeInfo.isNullable ? `?${converter}` : converter;
}

export function getType(type: any, options: any): string {

    if (!type) {
      return "object";
    }

    const typeInfo: ITypeInfo = getTypeInfo(type, options);
    const typeName: string = typeInfo.isPascalCase ? toPascalCase(typeInfo.name) : typeInfo.name;

    if (typeInfo.isArray) {
        return typeInfo.isNullable ? `List<${typeName}?>` : `List<${typeName}>`;
    } else {
        return typeInfo.isNullable ? `${typeName}?` : typeName;
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