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

function AppController() {
    this._element = document.body;
    this._recognizer = new Recognizer(this);

    this._frame = document.createElement('div');
    this._frame.className = 'frame';

    this._surface = document.createElement('div');
    this._surface.className = 'surface';

    this._tools = new Toolbox(this);
    this._inspector = new Inspector(this);

    this._element.appendChild(this._frame);
    this._element.appendChild(this._surface);
    this._element.appendChild(this._inspector.handlesElement());
    this._element.appendChild(this._inspector.element());
    this._element.appendChild(this._recognizer.element());
    this._element.appendChild(this._tools.element());

    this._grid = new Grid(this, this._frame, this._surface);
}
AppController.prototype.grid = function() { return this._grid; }
AppController.prototype.addItem = function(item) {
    var gridX = this._grid.x();
    var gridY = this._grid.y();
    item.bounds.x -= gridX;
    item.bounds.y -= gridY;

    this._grid.snap(item);
    this._surface.appendChild(item.sync());
    makeInspectable(item, this._inspector);
}
AppController.prototype.allowCreation = function(allow) {
    this._recognizer.element().style.pointerEvents = allow ? '' : 'none';
    if (!allow) this._recognizer.hide();
}
AppController.prototype.allowInspect = function(allow) {
    this._surface.style.pointerEvents = allow ? 'auto' : 'none';
    if (!allow) this._inspector.deselect();
}

window.addEventListener('load', function() { new AppController(); }, false);
