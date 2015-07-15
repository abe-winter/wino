/**
@module wino
WINO stands for 'wysiwyg in name only'.
This provides the Wino class.
*/
"use strict";

// todo: dirty flag and setClean function.

var
  h = require('hyperscript'),
  log = require('loglevel');

var swapper = require('./swapper');

/**
@constructor
@classdec WINO (wysiwyg in name only). Use with static/wino.css.
This manages a list of Swapper instances, adding:
1. split & merge
2. cursor transition
@prop {function} renderer
@prop {Swapper[]} swappers
@prop {Node} node
*/
function Wino(renderer){
  this.renderer = renderer;
  this.swappers = [];
  this.node = null;
}

// there has to be a library that defines these
var KEYS = {
  up:38,
  down:40,
  left:37,
  right:39,
  enter:13,
  bksp:8,
  del:46,
};

Wino.prototype.activeSwapperIndex = function(){
  // return index of active swapper else null
  var i = 0;
  for (var swap of this.swappers){
    if (swap.active) return i;
    i += 1;
  }
  return null;
}

Wino.prototype.onkey = function(event){
  if (event.target.tagName != 'TEXTAREA'){
    log.warn('Wino.onkey target tag not textarea');
    return;
  }
  switch (event.keyCode){
    case KEYS.up:
    case KEYS.left:
      // note: for now, up and left are the same because I don't want to write offset discovery
      if (event.target.selectionStart == 0){
        var i = this.activeSwapperIndex();
        if (i !== null && i > 0){
          this.swappers[i-1].focus(true);
          event.preventDefault();
          return false;
        }
      }
      break;
    case KEYS.down:
    case KEYS.right:
      // note: for now, down & right are identical because offset discovery doesn't exist
      if (event.target.selectionStart == event.target.value.length){
        var i = this.activeSwapperIndex();
        if (i !== null && i < this.swappers.length - 1){
          this.swappers[i+1].focus();
          event.preventDefault();
          return false;
        }
      }
      break;
    case KEYS.enter:
      if (event.target.selectionStart != event.target.selectionEnd)
        throw "notimp: KEYS.enter and sel not empty";
      var i = this.activeSwapperIndex();
      if (event.target.selectionStart == event.target.value.length){
        // note: testing at-end (this block) before at-beginning (else if below) so that empty logic is at-end
        this.addSwapper(false).focus();
      }
      else if (event.target.selectionStart == 0){
        this.addSwapper(true);
      }
      else {
        var active = this.swappers[this.activeSwapperIndex()];
        var start = event.target.selectionStart;
        var fulltext = active.value();
        var swap = this.addSwapper(true);
        active.set(fulltext.slice(start));
        swap.set(fulltext.slice(0,start));
        event.target.selectionStart = event.target.selectionEnd = 0;
        // and active stays active
      }
      event.preventDefault();
      return false;
    case KEYS.bksp:
      if (event.target.selectionStart == 0){
        var i = this.activeSwapperIndex();
        if (i > 0) this.merge(i-1);
        event.preventDefault(); // or else we navigate back
        return false;
      }
      break;
    case KEYS.del:
      if (event.target.selectionStart == event.target.value.length){
        var i = this.activeSwapperIndex();
        if (i <= this.swappers.length - 2) this.merge(i);
        event.preventDefault();
        return false;
      }
      break;
  }
}

/**
combine value of this.swappers[i_first+1] into i_first, set cursor
@param {integer} i_first - index in this.swappers of first of the two swappers we're merging
@returns {Swapper} the deleted swapper; if anyone has a use for it
*/
Wino.prototype.merge = function(i_first){
  if (i_first+1 >= this.swappers.length) throw "i_first too high";
  var source = this.swappers[i_first + 1], target = this.swappers[i_first];
  this.swappers.splice(i_first + 1, 1);
  var old_len = target.value().length;
  target.set(target.value() + source.value());
  source.node.remove();
  target.focus();
  var text = target.node.querySelector('textarea');
  text.selectionStart = text.selectionEnd = old_len;
  return source;
}

/**
helper for Wino.onkey KEYS.enter case. inserts an empty Swapper before or after current focus.
@param {boolean} isBefore - true means ins above this.activeSwapperIndex(), else ins below
@returns {Swapper} the new swapper (which is also available in this.swappers)
*/
Wino.prototype.addSwapper = function(isBefore){
  var i = this.activeSwapperIndex();
  var insert_pos = isBefore ? i : i + 1;
  var swap = new Swapper(this.renderer);
  this.swappers.splice(insert_pos, 0, swap);
  this.node.insertBefore(
    swap.render('', this.extraEvents()),
    // todo(TEST): make sure this works when nextSibling is null (i.e. end of last paragraph)
    isBefore ? this.swappers[i+1].node : this.swappers[i].node.nextElementSibling
  )
  return swap;
}

/**
generates the extraEvents object passed to Swapper.render
@returns {Object} with an onkeydown key
*/
Wino.prototype.extraEvents = function(){
  return {
    onkeydown: this.onkey.bind(this)
  };
}

/**
splits provided text into lines and generates Swapper instances to manage them
@param {string} text
@returns {Node}
*/
Wino.prototype.render = function(text){
  var this_ = this;
  var elts = [];
  var extraEvents = this.extraEvents();
  this.swappers = text.split('\n').map(function(line){
    var swap = new swapper.Swapper(this_.renderer);
    elts.push(swap.render(line, extraEvents));
    return swap;
  });
  this.node = h('wino', elts);
  return this.node;
}

/**
assembles a whole string by joining the individual swappers
@returns {string} the box's contents
*/
Wino.prototype.value = function(){
  throw "notimp";
}

module.exports.Wino = Wino;
