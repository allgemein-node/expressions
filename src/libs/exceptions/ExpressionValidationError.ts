

export class ExpressionValidationError extends Error {

  constructor(msg:string){
    super(msg);
    Object.setPrototypeOf(this, ExpressionValidationError.prototype);
  }

}
