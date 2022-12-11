import type { ZodType } from 'zod';
import type { HttpRequestMethod } from './httpMethods';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodType = ZodType<any, any, any>;

export type ApiSchemaBase = Record<
  string,
  Partial<Record<
    HttpRequestMethod,
    {
      request: AnyZodType,
      response: Record<number, AnyZodType>
    }
  >>
>;
