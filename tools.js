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

// Toolbox. This UI uses cording, which is unusual; maybe it won't work out? You
// press-and-hold a button while doing the action, with a toggle for mouse so that
// it can limp on PC.
function ToolButton(image, x, y, activated) {
    var item = new Item();
    item.bounds.x = x;
    item.bounds.y = y;
    item.bounds.width = 56;
    item.bounds.height = 56;
    item.radius = 30;
    item.color = '#424242';
    item.shadow.color = 'black';
    item.shadow.y = 2;
    item.shadow.radius = 3;
    item.image = image;
    this._element = item.sync();
    this._item = item;

    var pressed = false;

    function change() {
        item.color = pressed ? '#0277bd' : '#424242';
        item._dirty = true;
        item.sync();
        if (activated) activated(pressed);
    }

    this._element.addEventListener('touchstart',
        function(e) {
            pressed = true;
            change();
            e.preventDefault();
            e.stopPropagation();
        }, false);
    this._element.addEventListener('touchend',
        function(e) {
            pressed = false;
            change();
            e.preventDefault();
            e.stopPropagation();
        }, false);
    this._element.addEventListener('click',
        function(e) {
            pressed = !pressed;
            change();
        }, false);
}
ToolButton.prototype.element = function() { return this._element; }

function Toolbox(appController) {
    this._appController = appController;
    this._element = document.createElement('div');
    this._element.className = 'toolbox';

    var createButton = new ToolButton('assets/ic_edit_white_36dp.png', 10, 66, appController.allowCreation.bind(appController));
    this._element.appendChild(createButton.element());

    var inspect = new ToolButton('assets/ic_adjust_white_36dp.png', 10, 0, appController.allowInspect.bind(appController));
    this._element.appendChild(inspect.element());

    appController.allowCreation(false);
}
Toolbox.prototype.element = function() { return this._element; }
