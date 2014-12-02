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

// Definition of some basic type metadata so that we can construct
// an inspector for objects that declare typeinfo for themselves.

function numberTypeInfo(min, max, step, unit) {
    return {
        type: Number.prototype,
        min: min,
        max: max,
        step: step,
        unit: unit
    };
}

function colorTypeInfo() { return { type: 'color' }; }

function enumTypeInfo(options) {
    return {
        type: 'enum',
        options: options
    };
}

function stringTypeInfo() { return { type: String.prototype } }
function objectTypeInfo(keyTypes) { return { type: Object.prototype, keyTypes: keyTypes }; }
function arrayTypeInfo(childType) { return { type: Array.prototype, chlidType: childType }; }
