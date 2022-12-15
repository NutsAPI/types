import type { HttpRequestMethod } from './httpMethods';

export type ZodLike<T> = {
  _output: T,
  safeParse: (data: unknown) => { success: true, data: T } | { success: false, error: unknown },
};

export type AnyZodLike = ZodLike<any>;

export type ApiRequestBase = AnyZodLike;
export type ApiResponseBase = Record<number, AnyZodLike>;

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
