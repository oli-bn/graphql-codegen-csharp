import { SafeString } from "handlebars";
// tslint:disable-next-line:typedef
const pascalcase = require("pascalcase");
// tslint:disable-next-line:typedef
const camelCase = require("camelcase");
import { Variable, Type, Field, Operation, 
    Fragment, SelectionSetFragmentSpread, SelectionSetInlineFragment, SelectionSetItem } from "graphql-codegen-core";

const scalarTypeMapping : { [name: string]: string; } = {
    "Date" : "DateTime",
    "DateTime" : "DateTime",
    "Long" : "long",
    "BigDecimal" : "decimal",
    "Float": "float",
    "Float32Bit" : "float",
    "LocalTime" : "DateTime",
    "URI" : "Uri",
    "Char" : "char",
    "StringSet": "List<string>"
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

export function getType(type: any, options: any): string {

    if (!type) {
      return "object";
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

	const isNullable: boolean = isValueType === true && type.isRequired !== true;

	if(isPascalCase) {
		typeName = pascalcase(camelCase(typeName));
	}

    if (type.isArray) {
        return isNullable ? `List<${typeName}?>` : `List<${typeName}>`;
    } else {
        if(typeName.indexOf("List<") > -1) {
            return typeName;
        } else {
            return isNullable ? `${typeName}?` : typeName;
        }
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

export function getTypeIfUsed(innerModels: SelectionSetItem[], classes: Type[]): Type[] {

    const selectionSet: { [name: string]: SelectionSetItem; } = { };
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

    const o: any = (fields: []) => {
        if(!fields) {
            return;
        }

        const p: any = (set: []) => {
            set.forEach((t: any) => {
                if(t.type === "SupplierSummary") {
                    console.log(t);
                }
                const selectionType: Type = typeNameMap[t.type];
                if(selectionSet[t.type] === undefined && selectionType !== undefined && usedTypesMap[t.type] === undefined) {
                    usedTypesMap[t.type] = selectionType;
                }
                if(t.hasFields) {
                    o(t.fields);
                } else {
                    p(t.selectionSet);
                }
            });
        };

        fields.forEach((f: any) => {
            p(f.selectionSet);
        });
    };

    innerModels.forEach((m: any) => {
        if(m.modelType === "SupplierSummary") {
            console.log(m);
        }
        o(m.fields);
    });

    return Object.values(usedTypesMap);
}

export function getTypesIfUsed(inputTypes: [Type], operations: [Operation], classes: [Type], typeName: string): any {

    const typeNameMap: { [name: string]: Type; } = { };
    const usedTypes: Type[] = [];

    classes.forEach(c => {
        if(typeNameMap[c.name] === undefined) {
            typeNameMap[c.name] = c;
        }
    });

    const processType: any = (typeName: string) => {
        let type: Type = typeNameMap[typeName];
        if(type !== undefined) {
            if(usedTypes.indexOf(type) === -1) {
                if(typeName === "scalars") {
                    const csharpTypeName: string = scalarTypeMapping[typeName];
                    if(csharpTypeName === undefined) {
                        usedTypes.push(type);
                    }
                } else {
                    usedTypes.push(type);
                }
            }
        }
    };

    const processFields: any = (fields: [Field]) => {
        if(!fields) {
            return;
        }
        fields.forEach(f => {
            processType(f.type);
        });
    };

    const n: any = o => {
        if(o.hasFields) {
            o.selectionSet.forEach(e => {
                processType(e.type);
                n(e);
            });
        }
    };
/*
    if(operations) {
        operations.forEach(o => {
            if(o.hasFields) {
                o.selectionSet.forEach(e => {
                    let oo: any = e;
                    processType(oo.type);
                    if(oo.hasFields) {
                        n(e);
                    }
                });
            }
        });
    } */

    if(inputTypes) {
        inputTypes.forEach(c => {
            processFields(c.fields);
        });
    }

    return usedTypes;
}