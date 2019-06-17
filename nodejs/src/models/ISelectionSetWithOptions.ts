import { Type } from "graphql-codegen-core";

export interface ISelectionSetWithOptions {
    isArray: boolean;
    schemaBaseTypeName: string;
    name: string;
    typeName: string;
    interfaceTypeName: string;
    isSelected: boolean;
    isInSchema: boolean;
}