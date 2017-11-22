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

function map (obj, kfn, vfn, opt) {
  opt = opt || {}
  var ret = opt.init || {}
  var keep_null = opt.keep_null
  var keys = opt.keys || Object.keys(obj)
  if (opt.deep) {
    keys = opt.deep.concat(keys)
  }
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i]
    var v = obj[k]
    if (kfn) {
      k = kfn(k, v, i)
    }
    if (vfn) {
      v = vfn(k, v, i)
    }
    if (k != null && (keep_null || v != null)) {
      ret[k] = v
    }
  }
  return ret
}

function filter (o, fn, opt) {
  opt = opt || {}
  var ret = opt.init || {}
  var keys = opt.keys || Object.keys(o)
  fn = fn || function (k, v) { return v }         // filter falsey values by default
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i]
    if (fn(k, o[k], i)) { ret[k] = o[k] }
  }
  return ret
}

function select (o, keys, opt) {
  opt = opt || {}
  var keep_null = opt.keep_null || false
  var ret = opt.init || {}
  for (var i = 0; i < keys.length; i++) {
    var v = o[keys[i]]
    if (v != null || keep_null) {
      ret[keys[i]] = v
    }
  }
  return ret
}

module.exports = {
  map: map,
  invert: function (o) {
    var ret = {}
    var keys = Object.keys(o)
    for (var i = 0; i < keys.length; i++) {
      ret[o[keys[i]]] = keys[i]
    }
    return ret
  },
  filter: filter,
  select: select,
  oa_push: function (o, k, v) {
    var a = o[k]
    if (!a) { o[k] = a = [] }
    a.push(v)
  },
  oo_put: function (o, k1, k2, v) {
    var oo = o[k1]
    if (!oo) { o[k1] = oo = {} }
    var prev = oo[k2]
    oo[k2] = v
    return prev
  },
  oo_get: function (o, k1, k2) {
    return o[k1] && o[k1][k2]
  },
  len: function (o) { return Object.keys(o).length },
  keys: function (o) { return Object.keys(o) },
  vals: function (o, keys) {
    var ret = []
    keys = keys || Object.keys(o)
    for (var i = 0; i < keys.length; i++) {
      ret[i] = o[keys[i]]
    }
    return ret
  },
}
