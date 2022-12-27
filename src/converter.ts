type ConvType = 'object' | 'payload';
export type Conv = Record<ConvType, unknown>;
type Tail<T> = T extends [unknown, ...infer U] ? U : [];

export type ConvResult<BaseType, T extends Conv, From extends ConvType, To extends Exclude<ConvType, From>>
  = keyof BaseType extends never ? BaseType : { [P in keyof BaseType]: BaseType[P] extends T[From] ? { __nutsapi_convert_blocked__: T[To] } : keyof BaseType[P] extends '__nutsapi_convert_blocked__' ? BaseType[P] : ConvResult<BaseType[P], T, From, To> };

type Unblock<T>
  = keyof T extends never ? T : { [P in keyof T]: T[P] extends { __nutsapi_convert_blocked__: infer U } ? U : Unblock<T[P]> };

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
  if(Array.isArray(x)) return x.map(x => convToObject<Convs, unknown>(x, converters)) as ConvChain<Base, Convs, 'payload', 'object'>;
  if(typeof x === 'object' && x !== null) return Object.fromEntries(Object.entries(x).map(v => [v[0], convToObject<Convs, unknown>(v[1], converters)])) as ConvChain<Base, Convs, 'payload', 'object'>;
  return (converters.find(c => c.isPayload(x))?.payloadToObject(x) ?? x) as ConvChain<Base, Convs, 'payload', 'object'>;
}

export function convToPayload<Convs extends Conv[], Base>(x: Base, converters: { [P in keyof Convs]: ConvWorker<Convs[P]> }): ConvChain<Base, Convs, 'object', 'payload'> {
  if(Array.isArray(x)) return x.map(v => { const t = (converters as ConvWorker<Conv>[]).find(c => c.isObject(v)); return t === undefined ? convToObject<Convs, unknown>(v, converters) : t.objectToPayload(v); }) as ConvChain<Base, Convs, 'object', 'payload'>;
  if(typeof x === 'object' && x !== null) return Object.fromEntries(Object.entries(x).map(v => { const t = (converters as ConvWorker<Conv>[]).find(c => c.isObject(v[1])); return [v[0], t === undefined ? convToObject<Convs, unknown>(v[1], converters): t.objectToPayload(v[1])]; })) as ConvChain<Base, Convs, 'object', 'payload'>;
  return x as ConvChain<Base, Convs, 'object', 'payload'> ;
}

