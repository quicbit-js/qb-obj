// Software License Agreement (ISC License)
//
// Copyright (c) 2017, Matthew Voss
//
// Permission to use, copy, modify, and/or distribute this software for
// any purpose with or without fee is hereby granted, provided that the
// above copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

var test = require('test-kit').tape()
var qbobj = require('.')

function val2str (v) {
  switch (typeof v) {
    case 'object':
      return v === null
        ? 'N'
        : (Array.isArray(v)
          ? '[' + v.length + ']'
          : '{' + Object.keys(v).length + '}')
    case 'boolean':   return v ? 'T' : 'F'
    case 'function':  return 'f'
    default:          return String(v)
  }
}

test('keys', function (t) {
  t.table_assert([
    [ 'o',                      'exp' ],
    [ {},                       [] ],
    [ {a:1,b:2},                ['a','b'] ],
  ], qbobj.keys)
})

test('vals', function (t) {
  t.table_assert([
    [ 'o',                      'exp' ],
    [ {},                       [] ],
    [ {a:1,b:2,c:null},         [1,2,null] ],
  ], qbobj.vals)
})

test('len', function (t) {
  t.table_assert([
    [ 'o',                          'exp' ],
    [ {},                           0 ],
    [ {a:1,b:2},                    2 ],
    [ [1,2,3],                      3 ],
  ], qbobj.len)
})

test('map', function (t) {
  var kvi = function (k, v, i) { return k + '@' + i + '.' + val2str(v)}
  var kgt = function (lim) { return function (k) { return k > lim ? k : null } }
  var vgt = function (lim) { return function (k,v) { return v > lim ? v : null } }
  t.table_assert([
    [ 'o',                          'kfn',    'vfn',    'opt',                      'exp' ],
    [ {},                           null,     null,     null,                       {} ],
    [ {a:3, b:null, c:13},          null,     null,      {},                        { a:3, c:13 } ],
    [ {a:3, b:7, c:13},             null,     kvi,      {},                         { a: 'a@0.3', b: 'b@1.7', c: 'c@2.13' } ],
    [ {a:3, b:7, c:13},             kvi,      null,     {},                         { 'a@0.3': 3, 'b@1.7': 7, 'c@2.13': 13 } ],
    [ {a:3, b:{z:[7,8]}, c:13},     kvi,      null,     {},                         { 'a@0.3': 3, 'b@1.{1}': { z: [ 7, 8 ] }, 'c@2.13': 13 } ],
    [ {a:3, b:{z:[7,8]}, c:13},     kvi,      null,     {init: {q:9}},              { q: 9, 'a@0.3': 3, 'b@1.{1}': { z: [ 7, 8 ] }, 'c@2.13': 13 } ],
    [ {a:3, b:{z:[7,8]}, c:13},     kvi,      null,     {init: {q:9}, keys:['c']},  { q: 9, 'c@0.13': 13 } ],
    [ {b:2, c:7, d:2},              kgt('b'), null,     {init: {a:1}},              { a:1, c:7, d:2 } ],
    [ {b:3, c:7, d:2},              null,     vgt(2),   {},                         { b:3, c:7 } ],
    [ {b:3, c:7, d:2},              kgt('b'), vgt(2),   {},                         { c:7 } ],
    [ {b:3, c:7, d:2},              kgt('b'), vgt(2),   {keep_null: 1},             { c:7, d:null } ],
  ], qbobj.map)
})

test('map deep', function (t) {
  A = function() { this.a = 3 }
  A.prototype.b = 4
  var ab = new A()
  var a = new A()
  t.table_assert([
    [ 'o',                          'kfn',    'vfn',    'opt',              'exp' ],
    [ ab,                           null,     null,     null,               {a:3} ],
    [ ab,                           null,     null,     {deep: ['b']},      {a:3, b:4} ],
  ], qbobj.map)
})

test('filter', function (t) {
  var sel_k = function (kexpr) { return function (k) { return kexpr.test(k) } }
  var sel_v = function (vmax) { return function (k,v) { return v <= vmax } }
  var sel_i = function (imax) { return function (k,v,i) { return i <= imax } }
  t.table_assert([
    [ 'o',              'fn',           'opt',              'exp' ],
    [ {},               null,           null,               {} ],
    [ {a:9, b:7},      sel_k(/x/),      null,               {} ],
    [ {a:9, b:7},      sel_k(/a/),      null,               {a:9} ],
    [ {a:9, b:7},      sel_k(/b/),      null,               {b:7} ],
    [ {a:9, b:7},      sel_v(3),        null,               {} ],
    [ {a:9, b:7},      sel_v(7),        null,               {b:7} ],
    [ {a:9, b:7},      sel_v(9),        null,               {a:9,b:7} ],
    [ {a:9, b:7},      sel_i(-1),       null,               {} ],
    [ {a:9, b:7},      sel_i(0),        null,               {a:9} ],
    [ {a:9, b:7},      sel_i(1),        null,               {a:9,b:7} ],
    [ {a:9, b:7},      sel_i(1),        {keys:['a','b']},   {a:9,b:7} ],
    [ {a:9, b:7},      sel_v(7),        {keys:['a','b']},   {b:7} ],
    [ {a:9, b:7},      sel_v(7),        {keys:['a']},       {} ],
    [ {a:9, b:7},      null,            {keys:['a']},       {a:9} ],
  ], qbobj.filter)
})

test('select', function (t) {
  t.table_assert([
    [ 'o',            'keys',             'opt',                'exp' ],
    [ {a:9, b:7},     [],                 null,                 {} ],
    [ {a:9, b:7},     ['a'],              null,                 {a:9} ],
    [ {a:9, b:7},     ['a'],              {init:{b:2}},         {a:9, b:2} ],
    [ {a:9, b:7},     ['b'],              null,                 {b:7} ],
    [ {a:9, b:7},     ['a','b'],          null,                 {a:9,b:7} ],
    [ {a:9, b:null},  ['a','b'],          null,                 {a:9} ],
    [ {a:9, b:null},  ['a','b'],          {keep_null:0},        {a:9} ],
    [ {a:9, b:null},  ['a','b'],          {keep_null:1},        {a:9,b:null} ],
  ], qbobj.select)
})

test('oo_put', function (t) {
  t.table_assert([
    [ 'o',              'k1',   'k2',   'v',    'exp' ],
    //                                          [ previous value, new-obj ]
    [ {},               'a',    'b',    7,      [undefined, {a:{b:7}}] ],
    [ {a:null},         'a',    'b',    7,      [undefined, {a:{b:7}}] ],
    [ {a:{b:7}},        'a',    'b',    8,      [7, {a:{b:8}}] ],
    [ {a:{b:7}},        'x',    'b',    2,      [undefined, {a:{b:7},x:{b:2}}] ],

  ], function (o, k1, k2, v) { var prev = qbobj.oo_put(o, k1, k2, v); return [prev, o] } )
})

test('oo_get', function (t) {
  t.table_assert([
    [ 'o',              'k1',   'k2',  'exp' ],
    [ {},               'a',    'b',   undefined ],
    [ {a:8},            'a',    'b',   undefined ],
    [ {a:{b:null}},     'a',    'b',   null ],
    [ {a:{b:4}},        'a',    'b',   4 ],

  ], qbobj.oo_get )
})

test('oa_push', function (t) {
  t.table_assert([
    [ 'o',              'k',    'v',    'exp' ],
    [ {},               'a',    null,   {a:[null]} ],
    [ {a:[]},           'a',    7,      {a:[7]} ],
    [ {a:[3]},          'a',    7,      {a:[3,7]} ],
    [ {a:[3],b:[2]},    'a',    7,      {a:[3,7],b:[2]} ],

  ], function (o, k, v) { qbobj.oa_push(o,k,v); return o } )
})

test('invert', function (t) {
  t.table_assert([
    [ 'o',                          'exp' ],
    [ {a: 1, b: 2},                 { 1: 'a', 2: 'b' } ],
    [ {a: 1, b: 'x', c: 0 },        { 1: 'a', 'x': 'b', 0: 'c' } ],
  ], qbobj.invert)
})
