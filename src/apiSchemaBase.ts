import type { ZodType } from 'zod';
import type { HttpRequestMethod } from './httpMethods';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyZodType = ZodType<any, any, any>;

export type ApiRequestBase = AnyZodType;
export type ApiResponseBase = Record<number, AnyZodType>;

export type ApiSchemaBase = Record<
  string,
  Partial<Record<
    HttpRequestMethod,
    {
      request: ApiRequestBase,
      response: ApiResponseBase,
    }
  >>
>;
