import * as index from "../templates/template.handlebars";
import * as classes from "../templates/class.handlebars";
import * as structs from "../templates/structs.handlebars";
import * as interfaces from "../templates/interface.handlebars";
import * as schema from "../templates/schema.handlebars";
import * as documents from "../templates/documents.handlebars";
import * as selectionSet from "../templates/selection-set.handlebars";
import * as fragments from "../templates/fragments.handlebars";
import * as enumTemplate from "../templates/enum.handlebars";
import { EInputType, GeneratorConfig } from "graphql-codegen-core";
import logger from "../helpers/logging";
import { PrimitiveTypesMapping, primitivesMapping } from "./primitivesMapping";
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
  } from "../helpers/csharpSyntax";

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
    primitives: PrimitiveTypesMapping = primitivesMapping;
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
      log: (... args: any[]): void => {
        // const level: string = args.hash.level;
        // logger.log(level, message);
        console.log(args);
      }
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