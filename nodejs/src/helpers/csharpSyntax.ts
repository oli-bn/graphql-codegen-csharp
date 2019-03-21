import { SafeString } from "handlebars";
// tslint:disable-next-line:typedef
import * as pascalcase from "pascalcase";
// tslint:disable-next-line:typedef
import * as camelCase from "camelcase";
import { Variable, Type, SelectionSetFieldNode, Operation, Field, Enum } from "graphql-codegen-core";
import { scalarTypeMapping } from "../config/csharpGeneratorConfig";
import logger from "./logging";

type TypeFilter = (t: Type) => boolean;
const defaultTypeFilter: TypeFilter = _ => true;

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
            var typeName: string = getType(variable, options) || "object";
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

interface ITypeInfo {
    name: string;
    isNullable: boolean;
    isPascalCase: boolean;
    isValueType: boolean;
    isArray: boolean;
}

export function getInnerModelName(type: any, options: any): string {
    return type.modelType;
}

function getTypeInfo(type: any, options: any): ITypeInfo {

    try {

        if (!type) {
            return null;
        }

        const baseType: any = type.type;

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

            if(options.data.root.primitivesMap[baseType] !== undefined) {
                realType = options.data.root.primitivesMap[baseType];
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

export function getType(type: any, options: any): string {
    try {
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
    } catch(e) {
        logger.error("getType", e);
        throw e;
    }
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
    try {

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
    } catch(e) {
        logger.error("getTypesIfUsed", e);
        throw e;
    }
}

export function getEnumTypesIfUsed(inputTypes: Type[], operations: Operation[], types: Type[], enums: Enum[]): Enum[] {
    try {
        const enumMap: { [name: string]: Enum; } = { };
        const usedTypesMap: { [name: string]: Enum; } = { };

        enums.forEach((e: Enum) => {
            if(enumMap[e.name] === undefined) { enumMap[e.name] = e; }
        });

        const usedTypes: Type[] = [];
        const addType: any = (t: Type) => {
            if(usedTypes.indexOf(t) === -1) {
                usedTypes.push(t);
            }
        };
        const processFields: any = (fields: Field[]) => {
            fields.forEach((f: Field) => {
                if(f.isEnum) {
                    const e: Enum = enumMap[f.type];
                    if(e !== undefined && usedTypesMap[e.name] === undefined) {
                        usedTypesMap[e.name] = e;
                    }
                }
            });
        };

        operations.forEach((o: any) => {
            o.innerModels.forEach((i: any) => { processFields(i.fields); });
            getTypeIfUsedWithFilter(o.innerModels, types, t => t.hasFields)
                .forEach((t: Type) => { addType(t); });
        });

        getInputTypeIfUsedWithFilter(inputTypes, operations, t => t.hasFields)
            .forEach((t: Type) => { addType(t); });

        usedTypes.forEach((t: Type) => { processFields(t.fields); });

        return Object.values(usedTypesMap);

    } catch(e) {
        logger.error("getEnumTypesIfUsed", e);
        throw e;
    }
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

function getInputTypeIfUsedWithFilter(inputTypes: Type[], operations: Operation[], filter: TypeFilter): Type[] {
    try {

        if(!inputTypes || !operations) {
            return [];
        }

        const typeFiler: (t: Type) => boolean = filter == null ? (_) => true : filter;
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
                    if(typeFiler(type)) {
                        usedTypesMap[fields.type] = type;
                    }
                    if(type.hasFields) {
                        processFields(type.fields);
                    }
                }
            });
        };

        inputTypes.forEach((inputType: Type) => {
            if(variablesTypeNames.indexOf(inputType.name) !== -1 && usedTypesMap[inputType.name] === undefined) {
                if(filter(inputType)) {
                    usedTypesMap[inputType.name] = inputType;
                }
                if(inputType.hasFields) {
                    processFields(inputType.fields);
                }
            }
        });

        return Object.values(usedTypesMap);
    } catch(e) {
        logger.error("getInputTypeIfUsedWithFilter", e);
        throw e;
    }
}

function getTypeIfUsedWithFilter(innerModels: any[], classes: Type[], filter: TypeFilter): Type[] {
    try {

        const selectionSet: { [name: string]: any; } = { };
        const typeNameMap: { [name: string]: Type; } = { };

        if(filter === null) {
            filter = (t: Type) => true;
        }

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
                        if(true) {
                            usedTypesMap[f.type] = selectionType;
                        }
                        processFields(selectionType.fields);
                    }
                }
            });
        };

        innerModels.forEach((m: any) => {
            processFields(m.fields);
        });

        return Object.values(usedTypesMap);

    } catch(e) {
        logger.error("getTypeIfUsedWithFilter", e);
        throw e;
    }
}

export function getInputTypeIfUsed(inputTypes: Type[], operations: Operation[]): Type[] {
    return getInputTypeIfUsedWithFilter(inputTypes, operations, defaultTypeFilter);
}

export function getTypeIfUsed(innerModels: any[], classes: Type[]): Type[] {
    return getTypeIfUsedWithFilter(innerModels, classes, defaultTypeFilter);
}
