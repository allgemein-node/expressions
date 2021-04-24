import {
  AbstractRef,
  IBuildOptions, IClassRef,
  IEntityRef,
  ILookupRegistry, ISchemaRef,
  METADATA_TYPE,
  METATYPE_ENTITY
} from '@allgemein/schema-api';
import {ProRef} from "./ProRef";

export class DummyRef extends AbstractRef implements IEntityRef {

  constructor(name: string = 'dummy') {
    super(METATYPE_ENTITY, name)
  }

  build<T>(instance: any, options?: IBuildOptions): T {
    return undefined;
  }

  create<T>(): T {
    return undefined;
  }

  getPropertyRef(name: string): ProRef {
    return undefined;
  }

  getPropertyRefs(): ProRef[] {
    return [new ProRef(true, 'id')];
  }

  id(): string {
    return "";
  }

  getClassRefFor(object: string | Function | IClassRef, type: METADATA_TYPE): IClassRef {
    return undefined;
  }

  getRegistry(): ILookupRegistry {
    return undefined;
  }

  getSchemaRefs(): ISchemaRef[] {
    return [];
  }

}
