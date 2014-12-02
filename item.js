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

// This is the definition of an item in drawgui. An item is some
// appearance on the screen, which could be interactive. The item's
// properties somewhat replicate the CSS style, but it's imporant to
// know that this isn't meant to be the same as CSS. We have to implement
// this on multiple platforms, so we only expose a limited simple set
// of stylable properties that we know we can make fast on OpenGL.
function Item() {
    var self = this;
    var shadow = {};
    var typeInfo = {};
    function addProperty(name, initial, typeinfo) {
        shadow[name] = initial;
        typeInfo[name] = typeinfo;
        Object.defineProperty(self, name,
            {
                configurable: true,
                enumerable: true,
                badboy: true,
                get: function() { return shadow[name]; },
                set: function(x) { if (shadow[name] === x) return; shadow[name] = x; self._dirty = true; }
            });
    }
    var radiusTypeInfo = numberTypeInfo(0, 1000, 1, 'px');
    addProperty('type', 'block', enumTypeInfo(['block', 'text']));
    addProperty('textContent', '', stringTypeInfo());
    addProperty('color', '#e0e0e0', colorTypeInfo());
    addProperty('textColor', '#000000', colorTypeInfo());
    addProperty('radius', 0, radiusTypeInfo);
    addProperty('opacity', 1, numberTypeInfo(0, 1, 0.001));

    var coordinateTypeInfo = numberTypeInfo(-Infinity, Infinity, 1, 'px');
    var shadowTypeInfo = objectTypeInfo({x: coordinateTypeInfo, y: coordinateTypeInfo, radius: radiusTypeInfo, color: colorTypeInfo()});
    addProperty('innerGlow', { x: 0, y: 0, radius: 0, color: 'transparent' }, shadowTypeInfo);
    addProperty('shadow', { x: 0, y: 0, radius: 0, color: 'transparent' }, shadowTypeInfo);
    addProperty('children', [], arrayTypeInfo(Item.prototype));
    addProperty('bounds', { x: 0, y: 0, width: 0, height: 0 });

    function scratchProperty(name, initial) {
        Object.defineProperty(
            self,
            name,
            { enumerable: false, configurable: false, writable: true, initial: initial });
    }
    scratchProperty('_dirty', true);
    scratchProperty('_element', null);
    scratchProperty('_typeInfo', typeInfo);
    this._typeInfo = typeInfo;
}
Item.prototype.typeInfo = function(name) { return this._typeInfo[name]; }
Item.prototype.sync = function() {
    // Reflect this item into DOM.
    if (!this._element) this._element = document.createElement('div');
    this._element.style.backgroundColor = this.color;
    this._element.style.color = this.textColor;
    this._element.style.borderRadius = this.radius + 'px';
    this._element.style.opacity = this.opacity;

    // XXX: This is to support buttons, it's not generic enough.
    if (this.image) {
        this._element.style.backgroundImage = 'url(' + this.image + ')';
        this._element.style.backgroundPosition = 'center';
        this._element.style.backgroundRepeat = 'no-repeat';
    } else {
        this._element.style.backgroundImage = 'none';
    }

    function makeShadow(shadow) {
        return shadow.x + 'px ' + shadow.y + 'px ' + shadow.radius + 'px ' + shadow.color;
    }

    var shadow = '';
    if (this.innerGlow.color != 'transparent') {
        shadow = 'inset ' + makeShadow(this.innerGlow);
        if (this.shadow.color != 'transparent')
            shadow += ', ';
    }
    if (this.shadow.color != 'transparent') {
        shadow += makeShadow(this.shadow);
    }

    this._element.style.boxShadow = shadow;
    this._element.style.top = this.bounds.y + 'px';
    this._element.style.left = this.bounds.x + 'px';
    this._element.style.width = this.bounds.width + 'px';
    this._element.style.height = this.bounds.height + 'px';

    while (this._element.firstChild != null)
        this._element.removeChild(this._element.firstChild);

    if (this.type !== 'block') this._element.textContent = this.textContent;
    else {
        for (var i = 0; i < this.children.length; i++)
            this._element.appendChild(this._children[i].element());
    }

    this._dirty = false;

    return this._element;
}
Item.prototype.element = function() {
    if (this._dirty) return this.sync();
    return this._element;
}
