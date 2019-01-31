import {suite, test} from 'mocha-typescript';

import {expect} from 'chai';
import {And, Eq, Key, Value} from "../../src";
import {Expressions} from "../../src/libs/expressions/Expressions";


@suite('functional/expressions')
class ExpressionsSpec {



  @test
  async 'source and target keys'() {

    const cond_01 = And(Eq('tableName', Value('condition_keeper')), Eq('tableId', Key('id')));
    let source_keys = cond_01.getSourceKeys();
    expect(source_keys).to.deep.eq(['tableName', 'tableId']);

    let target_keys = cond_01.getTargetKeys();
    expect(target_keys).to.deep.eq(['id']);


  }

  @test
  async 'get map'() {
    const cond_02 = And(Eq('tableNameWrong', Value('condition_keeper')), Eq('tableId', Key('id')));
    let map = cond_02.getMap();
    expect(map).to.be.deep.eq({tableNameWrong: '\'condition_keeper\'', tableId: 'id'});
  }


  @test
  async 'to and from json for "and" expression'() {
    const cond_02 = And(Eq('tableNameWrong', Value('condition_keeper')), Eq('tableId', Key('id')));
    let json = cond_02.toJson();
    let cond_parsed = Expressions.fromJson(json);
    let json2 = cond_parsed.toJson();
    expect(json).to.deep.eq(json2);

  }

  @test
  async 'from json for simple equal expression'() {
    const json_src_full = {
      test: {$eq: 'hallo'}
    };
    const json_src = {
      test: 'hallo'
    };
    let cond_parsed = Expressions.fromJson(json_src);
    let json2 = cond_parsed.toJson();
    expect(json2).to.deep.eq(json_src_full);

    cond_parsed = Expressions.fromJson(json_src_full);
    json2 = cond_parsed.toJson();
    expect(json2).to.deep.eq(json_src_full);

  }


  @test
  async 'from json for implicit and expression'() {
    const json_src_full = {
      $and: [
        {test: {$eq: 'hallo'}},
        {test2: {$eq: 2}},
      ]

    };
    const json_src = {
      test: 'hallo',
      test2: 2
    };
    let cond_parsed = Expressions.fromJson(json_src);
    let json2 = cond_parsed.toJson();
    expect(json2).to.deep.eq(json_src_full);

    cond_parsed = Expressions.fromJson(json_src_full);
    json2 = cond_parsed.toJson();
    expect(json2).to.deep.eq(json_src_full);

  }


  @test
  async 'from json for multiple and | or combined expression'() {
    const json_src_full = {
      $and: [
        {test: {$eq: 'hallo'}},
        {test2: {$eq: 2}},
        {
          $or: [
            {welt: {$eq: 'test'}}, {welt: {$eq: 2}}
          ]
        }
      ]
    };


    let cond_parsed = Expressions.fromJson(json_src_full);
    let json2 = cond_parsed.toJson();
    expect(json2).to.deep.eq(json_src_full);

    const json_src_full2 = {
      $and: [
        {
          $or: [
            {welt: {$eq: 'test'}}, {welt: {$eq: '2'}}
          ]
        },
        {
          $or: [
            {welt2: {$eq: 'test'}}, {welt2: {$eq: 2}}
          ]
        }

      ]
    };


    cond_parsed = Expressions.fromJson(json_src_full2);
    json2 = cond_parsed.toJson();
    expect(json2).to.deep.eq(json_src_full2);

  }


  @test
  async 'from json support for "in" expression'() {
    const json_src_full2 = {
      welt: {$in: ['test', 2]}
    };


    let cond_parsed = Expressions.fromJson(json_src_full2);
    let json2 = cond_parsed.toJson();
    expect(json2).to.deep.eq(json_src_full2);
  }
}

