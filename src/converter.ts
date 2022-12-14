type ConvType = 'object' | 'payload';
export type Conv = Record<ConvType, unknown>;
type Tail<T> = T extends [unknown, ...infer U] ? U : [];

export type ConvResult<BaseType, T extends Conv, From extends ConvType, To extends Exclude<ConvType, From>>
  = keyof BaseType extends never ? BaseType : {
    [P in keyof BaseType]:
        BaseType[P] extends infer U 
        ? U extends T[From]
          ? { __nutsapi_convert_blocked__: T[To] }
          : keyof BaseType[P] extends '__nutsapi_convert_blocked__' ? BaseType[P] : ConvResult<BaseType[P], T, From, To>
        : never
};

type Unblock<T>
  = keyof T extends never ? T : { [P in keyof T]: T[P] extends infer N ? N extends { __nutsapi_convert_blocked__: infer U } ? U : Unblock<T[P]> : never };

type ConvSolve<BaseType, T extends Conv[], From extends ConvType, To extends Exclude<ConvType, From>>
  = T extends [] ? BaseType : 
    T extends [Conv]
      ? ConvResult<BaseType, T[0], From, To>: T[0] extends Conv ? ConvSolve<ConvResult<BaseType, T[0], From, To>, Tail<T>, From, To> : never;

export type ConvChain<BaseType, T extends Conv[], From extends ConvType, To extends Exclude<ConvType, From>>
  = Unblock<ConvSolve<BaseType, T, From, To>>;

export type ConvWorker<T extends Conv> = {
  isPayload: (x: unknown) => x is T['payload'],
  payloadToObject: (x: T['payload']) => T['object'],
  isObject: (x: unknown) => x is T['object'],
  objectToPayload: (x: T['object']) => T['payload'],
}; 

export function convToObject<Convs extends Conv[], Base>(x: Base, converters: { [P in keyof Convs]: ConvWorker<Convs[P]> }): ConvChain<Base, Convs, 'payload', 'object'> {
  return converterBase(x, converters.map(v => ({ confirmer: v.isPayload, converter: v.payloadToObject }))) as ConvChain<Base, Convs, 'payload', 'object'>;
}

export function convToPayload<Convs extends Conv[], Base>(x: Base, converters: { [P in keyof Convs]: ConvWorker<Convs[P]> }): ConvChain<Base, Convs, 'object', 'payload'> {
  return converterBase(x, converters.map(v => ({ confirmer: v.isObject, converter: v.objectToPayload }))) as ConvChain<Base, Convs, 'object', 'payload'>;
}

function converterBase(value: unknown, converters: { confirmer: (x: unknown) => x is unknown, converter: (x: unknown) => unknown }[]): unknown{
  const available = converters.find(c => c.confirmer(value));
  if(available !== undefined) return available.converter(value);

  if(Array.isArray(value)) return value.map(v => converterBase(v, converters));
  
  if(value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(v => [v[0], converterBase(v[1], converters)]));

  return value;
}
