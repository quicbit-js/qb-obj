# qb-obj

[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][npm-url]
[![bitHound Dependencies][proddep-image]][proddep-link]
[![dev dependencies][devdep-image]][devdep-link]
[![code analysis][code-image]][code-link]

[npm-image]:       https://img.shields.io/npm/v/qb-obj.svg
[downloads-image]: https://img.shields.io/npm/dm/qb-obj.svg
[npm-url]:         https://npmjs.org/package/qb-obj
[proddep-image]:   https://www.bithound.io/github/quicbit-js/qb-obj/badges/dependencies.svg
[proddep-link]:    https://www.bithound.io/github/quicbit-js/qb-obj/master/dependencies/npm
[devdep-image]:    https://www.bithound.io/github/quicbit-js/qb-obj/badges/devDependencies.svg
[devdep-link]:     https://www.bithound.io/github/quicbit-js/qb-obj/master/dependencies/npm
[code-image]:      https://www.bithound.io/github/quicbit-js/qb-obj/badges/code.svg
[code-link]:       https://www.bithound.io/github/quicbit-js/qb-obj

A light-weight selection of our most broadly useful and simple object manipulation functions.

**Complies with the 100% test coverage and minimum dependency requirements** of 
[qb-standard](http://github.com/quicbit-js/qb-standard) . 

## Install

    npm install qb1-obj
    
# API

## map (obj, key_fn, val_fn, opt)

Map keys and values to a new map of keys and values.

    obj         object whose keys and values will used to build (mapped to) a new object.
                Note that the relationship of input is not one-to-one like array map.  nulls
                are dropped by default (but can be kept using the keep_null option).
    
    key_fn (    function, if provided maps keys to new keys (maintaining order)
      k           key
      v           value
      i           index (of object insert-order)
    )         
    val_fn (    function, if provided maps values to new values (maintaining order)
      k           object key, or null for arrays
      v           value
      i           index (of object insert-order)
    )          
    opt {       options
      init        object, if provided will be used as the root object to populate
      keep_null   if true, null and undefined values are kept (however, returning nulls for keys will still skip)
      deep        array of property names, if given, will be included even in prototypes (beyond shallow mapping Object.keys())
      keys        array of keys to use instead of Object.keys()
    }         
    

The default stripping of null/undefined values is useful on its own in testing to assert state and strip away
clutter:

    var map = require('qb-obj').map

    assert.same(some_result, { abc: null, other_data: null, pointer: 7 })
    
    assert.same(map(some_result), {pointer: 7})                       // easier to read

You can use the key_fn and val_fn, we to build other objects with minimal code:

    var obj = { abc: null, other_data: null, pointer: 7, tags: ['a','b','c'] }
    map(obj, (k, v) => { v && Array.isArray(v) })
    
    > { tags: ['a','b','c'] }
    
You can use map to redfine keys *and* values at the same time:

    var obj = { abc: null, other_data: null, pointer: 7, tags: ['a','b','c'] }
    map(
      obj, 
      (k, v) => { v && Array.isArray(v) ? k + '_array' : k },       // map keys 
      (k, v) => { k === 'other_data' ? 'no other data' : v }        // map values
    )
    
    > { other_data: 'no other data', tags_array: ['a','b','c'] }
    
... and many more useful combinations.

## invert (obj) 

Return a new object with the keys and values swapped:

    var invert = require('qb-obj').invert
    
    invert({ a: 1, 2: 'hello', 3: null })
    > { 1: a, hello: 2, null: 3 }
    
    String(value) is used to convert values to keys.  Collisions are resolved by favoring last value in natural insertion order 
    (as returned by Object.keys(obj)).

## filter (obj, fn, opt)

Similar to Array.prototype.filter().  Returns an object with only values for which fn() returns a truthy value.

    obj         object to filter into a new returned object.
    
    fn (        function (optional).  returning truthy will cause those key/values to be kept and returned.
      k           key           the key of the value to check
      v           value         the value to check
      i           index         the index of the key/value (in object insert-order)
    )         
    opt {       options
      init        object, if provided will be used as a destination on which values will be set.
      keys        array of keys to selectively traverse the object instead of Object.keys() (selects a subset).
                  keys can be useful for iterating over non-iterable properties.
    }         

## select (obj, keys, opt)

A simpler form of filter for just selecting the specified keys.  Null values dropped by default.

    obj         object to filter into a new returned object.
    
    fn (        function (optional).  returning truthy will cause those key/values to be kept and returned.
      k           key           the key of the value to check
      v           value         the value to check
      i           index         the index of the key/value (in object insert-order)
    )         
    opt {       options
      init        object, if provided will be used as a destination on which values will be set.
      keep_null   if true, null and undefined values are kept instead of dropped
      keys        array of keys to selectively traverse the object instead of Object.keys() (selects a subset).
                  keys can be useful for iterating over non-iterable properties.
    }         

## oa_push (obj, key, val)  "object-of-arrays-push" 

A short-hand function for putting an array value into an object and initializing an array at the same time
(for the first value)

    var oa_push = require('qb-obj').oa_push
    
    var my_obj = {}
    
    oa_push(my_obj, 'colors', 'blue')
    oa_push(my_obj, 'colors', 'red')
    my_obj
    > { colors: ['blue', 'red'] }
    
## oo_put (obj, key1, key2, val) "object-objects-put"

A short-hand function for putting a value within and object-of-objects and initializing the object
if needed (for the first value)

    var oo_put = require('qb-obj').oo_put
    
    var my_obj = {}
    
    oo_put(my_obj, 'colors', 'blue', 1 )
    oo_put(my_obj, 'colors', 'red', 2 )
    my_obj
    > { colors: { blue: 1, red: 2 } }

## oo_get (obj, key1, key2) 

Short-hand for getting a value out of an object-of-objects in one step:

    var myobj = { colors: { blue: 1, red: 2 } }
    
    oo_get(myobj, 'blue') 
    > 1
    
    oo_get(myobj, 'green')      // returns undefined instead of throwing exception
    > undefined

## len (obj)

Shorthand for:

    Object.keys(obj).length

## keys (obj)    
    
Shorthand for:

    Object.keys(obj)
    
## vals (obj, keys) 

Symmetrical with keys().  Returns all the values of the object as an array in order given by Object.keys() - 
or if keys is given, returns values for those keys.  
        