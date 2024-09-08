import * as _ from 'lodash';
import {ExprDesc} from '../descriptors/ExprDesc';

import {NotSupportedError, NotYetImplementedError} from '@allgemein/base';
import {In} from '../descriptors/InDesc';
import {Neq} from '../descriptors/NeqDesc';
import {Lt} from '../descriptors/LtDesc';
import {Gt} from '../descriptors/GtDesc';
import {And} from '../descriptors/AndDesc';
import {Eq} from '../descriptors/EqDesc';
import {Ge} from '../descriptors/GeDesc';
import {Key, KeyDesc} from '../descriptors/KeyDesc';
import {Le} from '../descriptors/LeDesc';
import {Or} from '../descriptors/OrDesc';
import {Value} from '../descriptors/ValueDesc';
import {GroupDesc} from '../descriptors/GroupDesc';
import {ExpressionInterpreter} from './ExpressionInterpreter';
import {IClassRef, IEntityRef, IPropertyRef} from '@allgemein/schema-api';
import {Like} from '../descriptors/LikeDesc';
import {Selector} from '../descriptors/Selector';


const REGEX_ID = /^(([\w_]+)=((\d+)|(\d+(\.|\,)\d+)|\'([^\']*)\'),?)$/;
const REGEX_ID_G = /^(([\w_]+)=((\d+)|(\d+(\.|\,)\d+)|\'([^\']*)\'),?)$ /g;

const REGEX_ID_K = /^((\d+)|(\d+(\.|\,)\d+),?)+$/;
const REGEX_ID_KG = /^((\d+)|(\d+(\.|\,)\d+),?)+$/g;

const REGEX_ID_W = /^(\'([^\']*)\',?)+$/;

export class Expressions {

  static EXPR_REGISTRY = {
    '$eq': (k: KeyDesc, v: Selector) => Eq(k, v),
    '$ne': (k: KeyDesc, v: Selector) => Neq(k, v),
    '$le': (k: KeyDesc, v: Selector) => Le(k, v),
    '$lt': (k: KeyDesc, v: Selector) => Lt(k, v),
    '$ge': (k: KeyDesc, v: Selector) => Ge(k, v),
    '$gt': (k: KeyDesc, v: Selector) => Gt(k, v),
    '$like': (k: KeyDesc, v: Selector) => Like(k, v),
    '$in': (k: KeyDesc, v: Selector) => In(k, v)
  }

  static parse(str: any): ExprDesc {
    if (_.isString(str)) {
      // check if JSON string
      try {
        let obj = JSON.parse(str.trim());
        return this.fromJson(obj);
      } catch (e) {
        try {
          let interpreter = new ExpressionInterpreter();
          return interpreter.interprete(str);
        } catch (e) {
          throw e;
        }
      }
    } else if (_.isPlainObject(str)) {
      return this.fromJson(str);
    } else {
      throw new NotSupportedError('object cant be interpreted to conditions, wrong format');
    }
  }


  //static validate(entityDef:EntityDef, condition:CondDesc)

  /*
    static fromJson(object: any): CondDesc {
      let cond: CondDesc;
      let q: any = [];
      Helper.walk(object, (data: WalkValues) => {
        console.log(data)
        let op: CondDesc = null;
        if (/^(\$and|\$or)$/.test(data.key) && _.isArray(data.value)) {
          console.log(data.key);

          if (data.key == '$and') {
            op = And()
          } else if (data.key == '$or') {
            op = Or()
          }
          (<any>data).cond = op;
        } else if (data.key.startsWith('$') && !_.isPlainObject(data.value)) {
          if (data.key == '$eq') {
            let value = null;
            if (_.isPlainObject(data.value)) {
              if (_.has(data.value, '$key')) {
                value = Key(data.value.key);
              } else {
                // ???
                throw new NotSupportedError('object given but without known operator')
              }
            } else {
              value = data.value;
            }


          }
        } else if (!data.key.startsWith('$')) {
          if (_.isPlainObject(data.value)) {

          } else {
            // eq k = v
            op = Eq(Key(data.key), Value(data.value));

          }
        }


        if (!cond) {
          cond = op;
        }
      });

      return cond;
    }
  */

  static exprKeys() {
    return Object.keys(this.EXPR_REGISTRY);
  }

  static fromJson(object: any, srcKey: string = null, parent: ExprDesc = null): ExprDesc {

    if (_.isArray(object)) {
      if (!parent || !(parent instanceof GroupDesc)) {
        parent = Or();
      }

      for (let obj of object) {
        let sub = this.fromJson(obj, null, parent);
        if (!(sub instanceof GroupDesc)) {
          parent.values.push(sub);
        }

      }

      return parent;
    } else if (_.isPlainObject(object)) {
      let keys = _.keys(object);
      let operator = keys.filter(k => k.startsWith('$'));
      if (keys.length == 1 && operator.length == 1) {
        let op = operator.shift();
        if (op == '$or' || op == '$and') {
          if (_.isArray(object[op])) {
            let desc = op == '$or' ? Or() : And();
            if (parent instanceof GroupDesc) {
              parent.values.push(desc);
            }
            return this.fromJson(object[op], null, desc);
          } else {
            throw new NotSupportedError('or|and must have an array as value ' + JSON.stringify(object, null, 2));
          }
        } else if (this.exprKeys().indexOf(op) > -1) {
          let key = Key(srcKey);
          let value: any = null;
          if (_.isArray(object[op])) {
            value = Value(object[op]);
          } else if (_.isPlainObject(object[op])) {
            if (_.has(object[op], '$key')) {
              value = Key(object[op].$key);
            } else {
              // ???
              throw new NotSupportedError('object given but without known operator');
            }
          } else {
            value = Value(object[op]);
          }
          return this.EXPR_REGISTRY[op](key, value);
        } else {
          throw new NotSupportedError('operator ' + op + ' not supported');
        }

      } else if (operator.length == 0) {
        let desc: ExprDesc[] = [];

        for (let k of keys) {
          desc.push(this.fromJson(object[k], k, null));
        }

        if (desc.length == 1) {
          return desc.shift();
        } else {
          return And(...desc);
        }
      } else {
        throw new NotSupportedError('object has wrong keys ' + JSON.stringify(object, null, 2));
      }
    } else {
      if (srcKey) {
        return Eq(Key(srcKey), object);
      }
      throw new NotSupportedError('object cant be resolved ' + JSON.stringify(object, null, 2));
    }
  }


  static parseLookupConditions(ref: IClassRef | IEntityRef, id: any): any | any[] {
    let idProps = ref.getPropertyRefs().filter(p => p.isIdentifier());


    if (/^\(.*(\)\s*,\s*\()?.*\)$/.test(id)) {
      let ids = id.replace(/^\(|\)$/g, '').split(/\)\s*,\s*\(/);
      return _.map(ids, _id => this.parseLookupConditions(ref, _id));
    } else if (REGEX_ID.test(id)) {
      let cond = {};
      let e;
      let keys = {};
      while ((e = REGEX_ID_G.exec(id)) !== null) {
        keys[e[2]] = e[4] || e[5] || e[7];
      }

      for (let idp of idProps) {
        if (keys[idp.name]) {
          cond[idp.name] = idp.convert(keys[idp.name]);
        }
      }
      return cond;
    } else if (/^\d+(,\d+)+$/.test(id)) {
      let ids = id.split(',');
      return _.map(ids, _id => this.parseLookupConditions(ref, _.isString(_id) ? parseInt(_id, 0) : _id));
    } else if (REGEX_ID_K.test(id)) {
      if (/^\'.*\'$/.test(id)) {
        id = id.replace(/^\'|\'$/g, '');
      }
      const conds = [];

      let cond = {};
      let e;
      let c = 0;
      while ((e = REGEX_ID_KG.exec(id)) !== null) {
        let p = idProps[c];
        let v = e[2] || e[3];
        c += 1;
        cond[p.name] = p.convert(v);
        if (c >= idProps.length) {
          conds.push(_.clone(cond));
          cond = {};
          c = 0;
        }
      }
      return conds.length === 1 ? conds.shift() : conds;

    } else {
      if (idProps.length == 1) {
        const prop = _.first(idProps);
        const ids = id.split(',').map((x: string) => x.trim());
        const conds = [];
        for (const _id of ids) {
          const cond = {};
          cond[prop.name] = prop.convert(_id);
          conds.push(cond);
        }

        return conds.length === 1 ? conds.shift() : conds;
      } else {

      }
    }
    throw new NotYetImplementedError('for ' + id);
  }


  static buildLookupConditions(ref: IClassRef | IEntityRef, data: any | any[]) {
    let idProps = ref.getPropertyRefs().filter(p => p.isIdentifier());
    if (_.isArray(data)) {
      let collect: string[] = [];
      data.forEach(d => {
        collect.push(this._buildLookupconditions(idProps, d));
      });
      if (idProps.length > 1) {
        return `(${collect.join('),(')})`;
      } else {
        return `${collect.join(',')}`;
      }
    } else {
      return this._buildLookupconditions(idProps, data);
    }
  }


  private static _buildLookupconditions(idProps: IPropertyRef[], data: any) {
    let idPk: string[] = [];
    idProps.forEach(id => {
      let v = id.get(data);
      if (_.isString(v)) {
        idPk.push('\'' + v + '\'');
      } else {
        idPk.push(v);
      }
    });
    return idPk.join(',');

  }


}
