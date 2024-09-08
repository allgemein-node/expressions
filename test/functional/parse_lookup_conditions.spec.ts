import {suite, test} from '@testdeck/mocha';

import {expect} from 'chai';
import {Expressions} from "../../src/libs/expressions/Expressions";
import {DummyRef} from "./schema/DummyRef";


@suite('functional/parse_lookup_conditions')
class ExpressionsSpec {


  @test
  async 'string id'() {

    const dummyRef = new DummyRef()


    // @ts-ignore
    const res = Expressions.parseLookupConditions(dummyRef, 'this_is_a_string_id');
    expect(res).to.deep.eq({id: 'this_is_a_string_id'});

    // @ts-ignore
    const res2 = Expressions.parseLookupConditions(dummyRef, 'this_is_a_string_12345');
    expect(res2).to.deep.eq({id: 'this_is_a_string_12345'});

    // @ts-ignore
    const res3 = Expressions.parseLookupConditions(dummyRef, 'this_is_a_string_12345,this_is_a_string_12346');
    expect(res3).to.deep.eq([{id: 'this_is_a_string_12345'},{id: 'this_is_a_string_12346'}]);
  }


}

