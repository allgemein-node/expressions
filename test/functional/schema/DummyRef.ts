import {AbstractRef, IBuildOptions, IEntityRef, XS_TYPE_ENTITY} from "commons-schema-api";
import {ProRef} from "./ProRef";

export class DummyRef extends AbstractRef implements IEntityRef {

  constructor(name: string = 'dummy') {
    super(XS_TYPE_ENTITY, name)
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

}
