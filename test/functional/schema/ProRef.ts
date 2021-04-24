import {
  AbstractRef,
  IClassRef,
  ILookupRegistry,
  IPropertyRef,
  METADATA_TYPE,
  METATYPE_PROPERTY
} from '@allgemein/schema-api';
import {DummyRef} from "./DummyRef";

export class ProRef extends AbstractRef implements IPropertyRef {
  isId: boolean = false;

  constructor(isId: boolean, name: string) {
    super(METATYPE_PROPERTY, name)
    this.isId = isId;
  }

  convert(i: any): any {
    return i;
  }

  get(instance: any): any {
  }

  getEntityRef(): DummyRef {
    return undefined;
  }

  getTargetRef(): IClassRef {
    return undefined;
  }

  getType(): string {
    return "";
  }

  id(): string {
    return "";
  }

  isCollection(): boolean {
    return false;
  }

  isEntityReference(): boolean {
    return false;
  }

  isIdentifier(): boolean {
    return this.isId;
  }

  isReference(): boolean {
    return false;
  }

  label(): string {
    return "";
  }

  getRegistry(): ILookupRegistry {
    return undefined;
  }

  getClassRefFor(object: string | Function | IClassRef, type: METADATA_TYPE): IClassRef {
    return undefined;
  }

}
