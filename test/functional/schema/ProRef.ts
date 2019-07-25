import {AbstractRef, IPropertyRef, XS_TYPE_PROPERTY} from "commons-schema-api";
import {DummyRef} from "./DummyRef";

export class ProRef extends AbstractRef implements IPropertyRef {
  isId: boolean = false;

  constructor(isId: boolean, name: string) {
    super(XS_TYPE_PROPERTY, name)
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

  getTargetRef(): DummyRef {
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

}
