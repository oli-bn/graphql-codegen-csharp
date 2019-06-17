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
  toCsharpComment,
  asQueryUnescapedText,
  asArgumentList,
  converterIfNeeded,
  toBetterPascalCase,
  getInnerModelName,
  getSelectionSetProperties,
  getValueTypeIfUsed
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
      toCsharpComment: toCsharpComment,
      asQueryUnescapedText: asQueryUnescapedText,
      asArgumentList: asArgumentList,
      converterIfNeeded: converterIfNeeded,
      toBetterPascalCase: toBetterPascalCase,
      getSelectionSetProperties: getSelectionSetProperties,
      getValueTypeIfUsed: getValueTypeIfUsed,
      getInnerModelName,
      log: (... args: any[]): void => {
        if(args && args.length > 0) {
          let message: string = "";
          let level: string = "debug";
          for(let i: number = 0; i < args.length; i++) {
            const arg: any = args[i];
            if(i === args.length -1) {
              if(arg.hash && arg.hash.level) {
                level = arg.hash.level;
              }
            } else {
              message = message + arg;
            }
          }
          logger.log(level, message);
        }
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