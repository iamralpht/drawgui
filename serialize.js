'use strict';

/*
Copyright 2014 Ralph Thomas

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Serialize objects with typeinfo.
function serialize(object, typeInfo) {
    if (!typeInfo && !object.typeInfo) return;
    if (!typeInfo) typeInfo = object.typeInfo();
    var s = {};
    for (var k in object) {
        var info = typeInfo[k];
        if (!info) continue;
        if (info.type == Object.prototype) {
            var obj = serialize(object[k], info.keyTypes);
            if (obj) s[k] = obj;
            continue;
        }
        if (info.type == Array.prototype) {
            var arr = [];
            var src = s[k];
            if (src && src.length) {
                for (var i = 0; i < src.length; i++) {
                    var child = serialize(src[i]);
                    if (child) arr.push(child);
                }
            }
            s[k] = arr;
            continue;
        }
        s[k] = object[k];
    }
    s.__constructor = object.constructor.name;
    return s;
}
// Quick and exploitable deserializer. Needs __constructor set.
function deserialize(dna) {
    var output = new window[dna.__constructor]();
    for (var k in dna) {
        output[k] = dna[k];
    }
    return output;
}
