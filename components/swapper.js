/**
@module swapper
*/
"use strict";

// todo: look for replacements here: https://github.com/yumyo/js-type-master
// todo: handle browser resize events

var _defer = require('lodash/function/defer');

/**
remove all childNodes
@param {Node} elt
*/
function clear(elt){
  while (elt.childNodes.length) elt.firstChild.remove();
  return elt;
};

/**
@param {string} text
@returns {Node} always a string for defaultRenderer; Swapper.renderer can also return a Node. hyperscript handles both
*/
function defaultRenderer(text){
  return document.createTextNode(text);
}

/**
@constructor
@classdesc this manages the textarea + render element.
@prop {function} renderer
@prop {Node} node
@prop {boolean} active - true means textarea is focused and in-front
*/
function Swapper(renderer){
  this.renderer = renderer || defaultRenderer;
  this.node = null;
  this.active = false;
}

// in theory same thing as lodash merge, but that's 40k
function merge(dict1, dict2){
  var ret = new Object;
  Object.keys(dict1).map(function(k){ret[k] = dict1[k];});
  Object.keys(dict2).map(function(k){ret[k] = dict2[k];});
  return ret;
}

/**
@param {string} text
@param {Object} extraEvents - Wyri uses this to pass in keydown handlers
@returns {Node}
*/
Swapper.prototype.render = function(text, extraEvents){
  extraEvents = extraEvents || {};
  var node = this.node = document.createElement('swapper');
  node.innerHTML = '<textarea class="swap-text"></textarea><swapper-view class="swap-text"></swapper-view>';
  var handlers = merge(extraEvents, {
    oninput: this.oninput.bind(this),
    onfocus: this.onfocus.bind(this),
    onblur: this.onblur.bind(this)
  });
  Object.keys(handlers).map(function(k){
    node.firstChild[k] = handlers[k];
  });
  node.firstChild.value = text;
  this.oninput(null);
  return this.node;
}

var ZINDEXES = {
  viewBehind: 10,
  // the rest of these aren't used; they're just for readers of this code
  textarea: 20,
  viewAhead: 30,
};

/** set this swapper's textarea focused. used by Wyri */
Swapper.prototype.focus = function(atEnd){
  var text = this.node.querySelector('textarea');
  text.focus();
  text.selectionStart = text.selectionEnd = atEnd ? text.value.length : 0;
}

/** hide swapper-view by sending it behind textarea */
Swapper.prototype.onfocus = function(event){
  this.node.querySelector('swapper-view').style.zIndex = ZINDEXES.viewBehind;
  this.active = true;
  this.draw(); // i.e. re-render with defaultRenderer
}

/** reset to CSS default */
Swapper.prototype.onblur = function(event){
  this.node.querySelector('swapper-view').style.zIndex = null;
  this.active = false;
  this.draw(); // i.e. re-render with this.renderer
}

/**
helper -- applies exceptions to strings so preview pane is the right size
@param {string} text
*/
function previewText(text){
  // todo: would be great to integrate this with cross-browser headless DOM tests
  if (!text.length){
    // @what convert empty string to ' '
    // @because for new chrome but not new firefox, min-height seems 10px or so too short
    return ' ';
  }
  else if (text.slice(-1) == '\n'){
    // @what pad empty line with space
    // @because otherwise line gets cut off
    return text + ' ';
  }
  else return text;
}

/** set swapper-view to this.renderer(textarea.value), update textarea size */
Swapper.prototype.draw = function(){
  var text = this.node.querySelector('textarea'), view = this.node.querySelector('swapper-view');
  // use defaultRenderer when active=true because size has to match (and also to maintain click performance)
  var renderer = this.active ? defaultRenderer : this.renderer;
  clear(view).appendChild(renderer(previewText(text.value)));
  _defer(function(){
    // todo: find a way to do this without _defer -- creates a flicker
    text.style.height = view.offsetHeight + 'px';
  });
}

/**
update value and redraw
@param {string} text
*/
Swapper.prototype.set = function(text){
  this.node.querySelector('textarea').value = text;
  this.draw();
}

/** @returns {string} current value in the textarea */
Swapper.prototype.value = function(){
  return this.node.querySelector('textarea').value;
}

Swapper.prototype.oninput = function(event){
  this.draw();
}

module.exports.Swapper = Swapper;
