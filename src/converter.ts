export type ConvType = 'object' | 'payload';
export type Conv = Record<ConvType, unknown>;
type Head<T> = T extends [infer U, ...unknown[]] ? U : never;
type Tail<T> = T extends [unknown, ...infer U] ? U : [];

export type ConvResult<BaseType, T extends Conv, From extends ConvType, To extends Exclude<ConvType, From>>
  = keyof BaseType extends never ? BaseType : { [P in keyof BaseType]: BaseType[P] extends T[From] ? T[To] : ConvResult<BaseType[P], T, From, To> };

export type ConvChain<BaseType, T extends Conv[], From extends ConvType, To extends Exclude<ConvType, From>>
  = BaseType extends [] ? BaseType : 
    T extends [Conv]
      ? ConvResult<BaseType, Head<T>, From, To>: Head<T> extends Conv ? ConvChain<ConvResult<BaseType, Head<T>, From, To>, Tail<T>, From, To> : never;

export type ConvWorker<T extends Conv> = {
  isPayload: (x: unknown) => x is T['payload'],
  payloadToObject: (x: T['payload']) => T['object'],
  isObject: (x: unknown) => x is T['object'],
  objectToPayload: (x: T['object']) => T['payload'],
}; 
type ConverterArray = [] | [Conv] | [Conv, Conv] | [Conv, Conv, Conv] | [Conv, Conv, Conv, Conv];

export function convToObject<Convs extends ConverterArray, Base>(x: Base, converters: { [P in keyof Convs]: ConvWorker<Convs[P]> }): ConvChain<Base, Convs, 'payload', 'object'> {
  if(Array.isArray(x)) return x.map(v => { const t = (converters as ConvWorker<Conv>[]).find(c => c.isPayload(v)); return t === undefined ? convToObject<Convs, unknown>(v, converters) : t.payloadToObject(v); }) as ConvChain<Base, Convs, 'payload', 'object'>;
  if(typeof x === 'object' && x !== null) return Object.fromEntries(Object.entries(x).map(v => { const t = (converters as ConvWorker<Conv>[]).find(c => c.isPayload(v[1])); return [v[0], t === undefined ? convToObject<Convs, unknown>(v[1], converters): t.payloadToObject(v[1])]; })) as ConvChain<Base, Convs, 'payload', 'object'>;
  return x as ConvChain<Base, Convs, 'payload', 'object'> ;
}

export function convToPayload<Convs extends ConverterArray, Base>(x: Base, converters: { [P in keyof Convs]: ConvWorker<Convs[P]> }): ConvChain<Base, Convs, 'object', 'payload'> {
  if(Array.isArray(x)) return x.map(v => { const t = (converters as ConvWorker<Conv>[]).find(c => c.isObject(v)); return t === undefined ? convToObject<Convs, unknown>(v, converters) : t.objectToPayload(v); }) as ConvChain<Base, Convs, 'object', 'payload'>;
  if(typeof x === 'object' && x !== null) return Object.fromEntries(Object.entries(x).map(v => { const t = (converters as ConvWorker<Conv>[]).find(c => c.isObject(v[1])); return [v[0], t === undefined ? convToObject<Convs, unknown>(v[1], converters): t.objectToPayload(v[1])]; })) as ConvChain<Base, Convs, 'object', 'payload'>;
  return x as ConvChain<Base, Convs, 'object', 'payload'> ;
}

