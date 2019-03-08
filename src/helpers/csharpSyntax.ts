import { SafeString } from "handlebars";
// tslint:disable-next-line:typedef
import * as pascalcase from "pascalcase";
// tslint:disable-next-line:typedef
import * as camelCase from "camelcase";
import { Variable, Type, SelectionSetFieldNode, Operation, Field } from "graphql-codegen-core";

const scalarTypeMapping : { [name: string]: string; } = {
    "Date" : "DateTime",
    "DateTime" : "DateTime",
    "Long" : "long",
    "BigDecimal" : "decimal",
    "Float": "float",
    "Float32Bit" : "float",
    "LocalTime" : "DateTime",
    "LocalDate" : "DateTime",
    "URI" : "Uri",
    "Char" : "char",
    "StringSet": "List<string>",
    "X509Certificate": "string",
};

const typeConverterMapping : { [name: string]: string; } = {
    "Date" : ".ToString(\"yyyy-MM-dd\")",
};

export function toBetterPascalCase(text: string): string {
    return pascalcase(camelCase(text));
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
        list += `${typeName} ${camelCase(variable.name)}`;
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
    const typeName: string = typeInfo.isPascalCase ? toBetterPascalCase(typeInfo.name) : typeInfo.name;

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

export function getValueTypeIfUsed(enums: Type[]): Type[] {
    const valueTypes: Type[] = [];

    enums.forEach(e => {
        if(scalarTypeMapping[e.name] === undefined) {
            valueTypes.push(e);
        }
    });

    return valueTypes;
}

export function getInputTypeIfUsed(inputTypes: Type[], operations: Operation[]): Type[] {

    if(!inputTypes || !operations) {
        return [];
    }
    const variablesTypeNames: string[] = [];
    const usedTypesMap: { [name: string]: Type; } = { };
    const typeNameMap: { [name: string]: Type; } = { };

    inputTypes.forEach(c => {
        if(typeNameMap[c.name] === undefined) {
            typeNameMap[c.name] = c;
        }
    });

    operations.forEach((o: Operation) => {
        if(o.hasVariables) {
            o.variables.forEach((v: Variable) => {
                if(variablesTypeNames.indexOf(v.type) === -1) {
                    variablesTypeNames.push(v.type);
                }
            });
        }
    });

    const processFields: any = (fields: Field[]) => {
        fields.forEach((fields: Field) => {
            let type: Type = typeNameMap[fields.type];
            if(type !== undefined && usedTypesMap[fields.type] === undefined) {
                usedTypesMap[fields.type] = type;
                if(type.hasFields) {
                    processFields(type.fields);
                }
            }
        });
    };

    inputTypes.forEach((inputType: Type) => {
        if(variablesTypeNames.indexOf(inputType.name) !== -1 && usedTypesMap[inputType.name] === undefined) {
            usedTypesMap[inputType.name] = inputType;
            if(inputType.hasFields) {
                processFields(inputType.fields);
            }
        }
    });

    return Object.values(usedTypesMap);
}

export function getTypeIfUsed(innerModels: any[], classes: Type[]): Type[] {

    const selectionSet: { [name: string]: any; } = { };
    const typeNameMap: { [name: string]: Type; } = { };

    innerModels.forEach((m: any) => {
        let name: string = m.modelType;
        selectionSet[name] = m;
    });

    classes.forEach(c => {
        if(typeNameMap[c.name] === undefined) {
            typeNameMap[c.name] = c;
        }
    });

    const usedTypesMap: { [name: string]: Type; } = { };

    const processFields: any = (fields: SelectionSetFieldNode[]) => {
        if(!fields) {
            return;
        }
        fields.forEach((f: SelectionSetFieldNode) => {
            const selectionType: Type = typeNameMap[f.type];
            if(selectionType !== undefined) {
                if(selectionSet[f.type] === undefined && usedTypesMap[f.type] === undefined) {
                    usedTypesMap[f.type] = selectionType;
                    processFields(selectionType.fields);
                }
            }
        });
    };

    innerModels.forEach((m: any) => {
        processFields(m.fields);
    });

    return Object.values(usedTypesMap);
}
