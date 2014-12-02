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

// Inspector: two bits; drag handles on items, and an inspector UI to
//  tweak how things look/behave.

function Handles(appController) {
    this._appController = appController;
    this._element = document.createElement('div');
    this._element.className = 'handles';
    this._element.style.display = 'none';

    function Handle(handles, x, y) {
        this._handles = handles;
        this._x = x; this._y = y;
        this._item = new Item();
        this._item.color = '#29b6f6';
        this._item.radius = 10;
        this._item.bounds.width = 20;
        this._item.bounds.height = 20;
        this._item.shadow.y = 1;
        this._item.shadow.radius = 2;
        this._item.shadow.color = 'black';
        var elem = this._item.sync();
        handles._element.appendChild(elem);
        addTouchOrMouseListener(elem, this);
    }
    Handle.prototype.place = function(w, h) {
        var x = this._x * w - 10;
        var y = this._y * h - 10;
        this._item.bounds.x = x;
        this._item.bounds.y = y;
        this._item._dirty = true;
        this._item.sync();
    }
    Handle.prototype.onTouchStart = function() {
        var fb = this._handles._focus.bounds;
        this._startBounds = { x: fb.x, y: fb.y, width: fb.width, height: fb.height };
    }
    Handle.prototype.onTouchMove = function(dx, dy) {
        if (this._x == 0.5) dx = 0;
        if (this._y == 0.5) dy = 0;
        var widthChange = dx * this._x;
        var heightChange = dy * this._y;
        var xChange = dx - widthChange;
        var yChange = dy - heightChange;
        widthChange -= xChange;
        heightChange -= yChange;

        var x = this._startBounds.x + xChange;
        var y = this._startBounds.y + yChange;
        var w = this._startBounds.width + widthChange;
        var h = this._startBounds.height + heightChange;

        if (w < 0 || h < 0) return;

        this._handles._focus.bounds.x = x;
        this._handles._focus.bounds.y = y;
        this._handles._focus.bounds.width = w;
        this._handles._focus.bounds.height = h;
        this._handles._update();
    }

    this._handles = [
        new Handle(this, 0, 0.5),
        new Handle(this, 0.5, 0),
        new Handle(this, 1, 0.5),
        new Handle(this, 0.5, 1)
    ];
    addTouchOrMouseListener(this._element, this);
}
Handles.prototype.element = function() { return this._element; }
Handles.prototype.show = function(item) {
    this._focus = item;
    var gridX = this._appController.grid().x();
    var gridY = this._appController.grid().y();

    this._element.style.left = (item.bounds.x + gridX) + 'px';
    this._element.style.top = (item.bounds.y + gridY) + 'px';
    this._element.style.width = item.bounds.width + 'px';
    this._element.style.height = item.bounds.height + 'px';
    this._element.style.display = 'block';
    for (var i = 0; i < this._handles.length; i++) {
        this._handles[i].place(item.bounds.width, item.bounds.height);
    }
}
Handles.prototype.hide = function() {
    this._element.style.display = 'none';
    this._focus = null;
}
// Touch handling; should be able to use the library itself to abstract
// this later on, since the behavior we want is just unconstrained movement.
Handles.prototype.onTouchStart = function() {
    this._startX = this._focus.bounds.x;
    this._startY = this._focus.bounds.y;
}
Handles.prototype.onTouchMove = function(dx, dy) {
    this._focus.bounds.x = this._startX + dx;
    this._focus.bounds.y = this._startY + dy;
    this._update();
}
Handles.prototype._update = function() {
    if (!this._focus) return;
    this._appController.grid().snap(this._focus);
    this._focus._dirty = true;
    this._focus.sync();
    this.show(this._focus);
}

function Inspector(appController) {
    this._handles = new Handles(appController);
    this._element = document.createElement('div');
    this._element.className = 'inspector';
    this._focus = null;
}
Inspector.prototype.handlesElement = function() { return this._handles.element(); }
Inspector.prototype.element = function() { return this._element; }
Inspector.prototype.select = function(item) {
    function update(target, name, e) { target[name] = e.target.value; target.sync(); }

    if (this._focus === item) return;

    if (this._focus) this.deselect();
    this._focus = item;
    if (!this._focus) return;
    this._handles.show(item);
    this._element.classList.add('show');
    // Do more; show properties of item...
    // XXX: Once we have components, lists and models then ditch this and
    //      replace it with that. This is the bootstrap inspector.
    while (this._element.firstChild)
        this._element.removeChild(this._element.firstChild);
    for (var k in this._focus) {
        var typeInfo = this._focus.typeInfo(k);
        if (!typeInfo) continue;
        var row = document.createElement('div');
        row.className = 'inspector-row';
        var name = document.createElement('span');
        name.textContent = k;
        row.appendChild(name);

        // Now build the controller UI.
        var input = document.createElement('input');
        switch (typeInfo.type) {
        case 'color': {
            input.type = 'color';
            input.value = this._focus[k];
            break;
            }
        case Number.prototype: {
            input.type = 'range';
            input.min = typeInfo.min;
            input.max = typeInfo.max;
            input.step = typeInfo.step || 1;
            input.value = this._focus[k];
            break;
            }
        case String.prototype:
            input.value = this._focus[k];
            break;
        case 'enum':
            input = document.createElement('select');
            for (var i = 0; i < typeInfo.options.length; i++) {
                var o = document.createElement('option');
                o.textContent = typeInfo.options[i];
                o.value = typeInfo.options[i];
                if (typeInfo.options[i] == this._focus[k])
                    o.selected = true;
                input.appendChild(o);
            }
            break;

        }
        input.addEventListener('input', update.bind(null, this._focus, k), false);
        row.appendChild(input);

        this._element.appendChild(row);
    }
}
Inspector.prototype.deselect = function() {
    if (!this._focus) return;
    this._handles.hide();
    this._focus = null;
    this._element.classList.remove('show');
}


function makeInspectable(item, inspector) {
    var elem = item.sync();
    addTouchOrMouseListener(elem, { onTouchEnd: function() { inspector.select(item); } });
}
