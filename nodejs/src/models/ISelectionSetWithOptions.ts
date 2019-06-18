import { Type } from "graphql-codegen-core";

export interface ISelectionSetWithOptions {
    isArray: boolean;
    itemName: string;
    schemaBaseTypeName: string;
    name: string;
    typeName: string;
    interfaceTypeName: string;
    isSelected: boolean;
    isInSchema: boolean;
}