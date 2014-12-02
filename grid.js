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

// Grid related functions. The grid maintains its origin and positions
// the frame and surface. It also snaps objects to itself.

function Grid(appController, frame, surface) {
    this._appController = appController;
    this._frame = frame;
    this._surface = surface;

    this._w = 0;
    this._h = 0;
    this._x = 0;
    this._y = 0;

    window.addEventListener('resize', this._resize.bind(this), true);
    this._resize();
}
Grid.prototype._resize = function() {
    var w = document.body.offsetWidth;
    var h = document.body.offsetHeight;

    if (w == this._w && h == this._h) return;

    // hardcoded frame size of 320x480.
    var x = Math.round((w - 320) / 2);
    var y = Math.round((h - 480) / 2);

    this._x = x; this._y = y;

    var transform = 'translate(' + x + 'px, ' + y + 'px)';

    this._frame.style.transform = transform;
    this._surface.style.transform = transform;
}
Grid.prototype.snap = function(item) {
    var self = this;
    // fixed grid size of 20px
    function _snap(x) {
        return Math.round(x / 20) * 20;
    }
    item.bounds.x = _snap(item.bounds.x);
    item.bounds.y = _snap(item.bounds.y);
    // XXX: Should snap bottom and right instead for more accuracy.
    item.bounds.width = _snap(item.bounds.width);
    item.bounds.height = _snap(item.bounds.height);
}
Grid.prototype.x = function() { return this._x; }
Grid.prototype.y = function() { return this._y; }
