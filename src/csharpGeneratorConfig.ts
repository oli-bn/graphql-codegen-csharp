import * as index from "./template.handlebars";
import * as classes from "./class.handlebars";
import * as structs from "./structs.handlebars";
import * as interfaces from "./interface.handlebars";
import * as schema from "./schema.handlebars";
import * as documents from "./documents.handlebars";
import * as selectionSet from "./selection-set.handlebars";
import * as fragments from "./fragments.handlebars";
import * as enumTemplate from "./enum.handlebars";
import { EInputType, GeneratorConfig } from "graphql-codegen-core";
import logger from "./helpers/logging";
import {
  getType,
  getOptionals,
  toCsharpComment,
  asQueryUnescapedText,
  asArgumentList,
  converterIfNeeded,
  asJsonString,
  getTypeIfUsed,
  getValueTypeIfUsed,
  getEnumTypesIfUsed,
  toBetterPascalCase,
  getInputTypeIfUsed,
  } from "./helpers/csharpSyntax";

class CsharpGeneratorConfig implements  GeneratorConfig {
    inputType: string = EInputType.SINGLE_FILE;
    flattenTypes: boolean = true;
    config?: { [configName: string]: any; } = {
      scalarTypeMapping,
    };
    templates: string | { [templateName: string]: string | string[]; } = {
      index,
      classes,
      schema,
      enumTemplate,
      documents,
      selectionSet,
      fragments,
      structs
    };
    primitives: { String: string; Int: string; Float: string; Boolean: string; ID: string; } = {
      String: "string",
      Int: "int",
      Float: "float",
      Boolean: "bool",
      ID: "string",
    };
    outFile?: string = "Classes.cs";
    filesExtension?: string;
    customHelpers?: { [helperName: string]: Function; } = {
      convertedType: getType,
      getOptionals: getOptionals,
      toCsharpComment: toCsharpComment,
      asQueryUnescapedText: asQueryUnescapedText,
      asArgumentList: asArgumentList,
      asJsonString: asJsonString,
      getTypeIfUsed: getTypeIfUsed,
      getValueTypeIfUsed: getValueTypeIfUsed,
      getInputTypeIfUsed: getInputTypeIfUsed,
      getEnumTypesIfUsed: getEnumTypesIfUsed,
      converterIfNeeded: converterIfNeeded,
      toBetterPascalCase: toBetterPascalCase,
    };
  }

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

  export { CsharpGeneratorConfig, scalarTypeMapping };