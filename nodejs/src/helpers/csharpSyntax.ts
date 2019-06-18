import { SafeString } from "handlebars";
// tslint:disable-next-line:typedef
import * as pascalcase from "pascalcase";
// tslint:disable-next-line:typedef
import * as camelCase from "camelcase";
import { Variable, Type, Field, } from "graphql-codegen-core";
import { ISelectionSetWithOptions } from "../models/ISelectionSetWithOptions";
import { ITypeInfo } from "../models/ITypeInfo";
import { scalarTypeMapping } from "../config/csharpGeneratorConfig";
import { primitivesMapping } from "../config/primitivesMapping";
import logger from "./logging";

const typeConverterMapping : { [name: string]: string; } = {
    "Date" : ".ToString(\"yyyy-MM-dd\")",
};

export function toBetterPascalCase(text: string): string {
    try {
        return pascalcase(camelCase(text));
    } catch(e) {
        logger.error("toBetterPascalCase", e);
        throw e;
    }
}

export function toCsharpComment(text: string): SafeString {
    try {
        if(text === undefined || text === null || text === "") {
            return new SafeString("");
        }
        return new SafeString(`/// <summary>${text.replace(/\r?\n|\r/g, " ")}</sumary>`);
    } catch(e) {
        logger.error("toCsharpComment", e);
        throw e;
    }
}

export function asQueryUnescapedText(text: string): SafeString {
    try {
        if(text) {
            return new SafeString(text.replace(/&#x3D;/g, "=").replace(/"/g, "\"\""));
        }

        return new SafeString("");
    } catch(e) {
        logger.error("asQueryUnescapedText", e);
        throw e;
    }
}

export function asArgumentList(variables: Variable[], options: any): string {
    try {
        var list: string = "";
        variables = (variables ? variables : []).filter(v => v !== null );

        if(variables.length === 0) {
            return "IResultProcessor<Data> resultProcessor = null";
        }
        for(let i: number = 0; i < variables.length; i++) {
            var variable: Variable = variables[i];
            var typeName: string = getType(variable, false, options) || "object";
            list += `${typeName} ${camelCase(variable.name)}`;
            if(i < variables.length - 1) {
                list += ", ";
            }
        }

        list += ", IResultProcessor<Data> resultProcessor = null";

        return list;
    } catch(e) {
        logger.error("asArgumentList", e);
        throw e;
    }
}

export function getInnerModelName(type: any, innerModels: any[], options: any): string {

    if(type.schemaBaseType !== undefined) {
        return toBetterPascalCase(type.schemaBaseType);
    }

    const isArray: boolean = type.isArray;
    type = innerModels.find(m => m.modelType === type.type);

    if(isArray) {
        return `List<${toBetterPascalCase(type.schemaBaseType)}>`;
    }

    return toBetterPascalCase(type.schemaBaseType);
}

function getTypeInfo(type: any, options: any): ITypeInfo {

    try {

        if (!type) {
            return null;
        }

        const baseType: any = type.type === undefined ? (type.name === undefined ? type : type.name) : type.type;

        let typeName: string = null;
        let isValueType: boolean = false;
        let realType: any = baseType;
        let isPascalCase: boolean = true;
        let isNullable: boolean = false;

        if(baseType.startsWith("_")) {
            typeName = baseType;
            isPascalCase = false;
        } else {

            isValueType = type.isScalar;

            if(primitivesMapping[baseType] !== undefined) {
                realType = primitivesMapping[baseType];
                isValueType = realType !== "string";
                isPascalCase = false;
            }

            typeName = scalarTypeMapping[baseType];
            if(typeName === undefined) {
                typeName = scalarTypeMapping[realType];
            }
            if(typeName === undefined) {
                typeName = realType;
            } else {
                isValueType = true;
                isPascalCase = false;
            }

            isNullable = isValueType === true && type.isRequired !== true;
        }
        return {
            name: typeName,
            isNullable: isNullable,
            isPascalCase: isPascalCase,
            isValueType: isValueType,
            isArray: type.isArray
        } as ITypeInfo;

    } catch(e) {
        logger.error("getTypeInfo", e);
        throw e;
    }
}

export function converterIfNeeded(variable: Variable, options: any): string {
    try {
        if(!variable) {
            return "";
        }

        const typeInfo: ITypeInfo = getTypeInfo(variable, options);
        const converter: string = typeConverterMapping[variable.type];

        if(converter === undefined) {
            return "";
        }

        return typeInfo.isNullable ? `?${converter}` : converter;
    } catch(e) {
        logger.error("converterIfNeeded", e);
        throw e;
    }
}

export function getType(type: any, asInterface: boolean, options: any): string {
    try {
        if (!type) {
            return "object";
        }

        const typeInfo: ITypeInfo = getTypeInfo(type, options);
        var typeName: string = typeInfo.name;

        if(typeInfo.isPascalCase) {
            typeName = toBetterPascalCase(typeInfo.name);
            if(asInterface) {
                typeName = `I${typeName}`;
            }
        }

        if (typeInfo.isArray) {
            if(asInterface) {
                return typeInfo.isNullable ? `IEnumerable<${typeName}?>` : `IEnumerable<${typeName}>`;
            }
            return typeInfo.isNullable ? `List<${typeName}?>` : `List<${typeName}>`;
        } else {
            return typeInfo.isNullable ? `${typeName}?` : typeName;
        }
    } catch(e) {
        logger.error("getType", e);
        throw e;
    }
}

export function getSelectionSetProperties(innerModel: Type, types: Type[]): ISelectionSetWithOptions[] {

    var typeLookup: { [name: string]: Type; } = { };
    types.forEach(t => typeLookup[t.name] = t);
    const schemaBaseTypeName: string = (innerModel as any).schemaBaseType;
    const schemaBaseType: Type = typeLookup[schemaBaseTypeName];
    var map: { [email: string]: ISelectionSetWithOptions; } = { };

    const add: any = (f: Field, isSelected: boolean, isInSchema: boolean) => {
        map[f.name] = {
            isArray: f.isArray,
            schemaBaseTypeName: schemaBaseTypeName,
            name: f.name,
            typeName: getType(f, false, null),
            interfaceTypeName: getType(f, true, null),
            isSelected: isSelected,
            isInSchema: isInSchema
        } as ISelectionSetWithOptions;
    };

    schemaBaseType.fields.forEach(f => { add(f, false, true); });

    innerModel.fields.forEach(f => {
        if(map[f.name] === undefined) {
            add(f, true, false);
        } else {
            map[f.name].isSelected = true;
        }
    });

    const selections: ISelectionSetWithOptions[] = Object.values(map);

    selections.forEach(s => s.itemName = s.interfaceTypeName.replace("IEnumerable<", "").replace(">", ""));

    return selections;
}

export function getValueTypeIfUsed(structs: Type[]): Type[] {
    try {
        const valueTypes: Type[] = [];

        structs.forEach(e => {
            if(scalarTypeMapping[e.name] === undefined) {
                valueTypes.push(e);
            }
        });

        return valueTypes;
    } catch(e) {
        logger.error("getValueTypeIfUsed", e);
        throw e;
    }
}

export function getNonOperationTypes(types: Type[]): Type[] {
    return types.filter(t => t.name !== "Query" && t.name !== "Mutation");
}
