"use strict";

/**
poor man's parser.
@param {RegExp} reg - regular expression to use for picking out matches
@param {string} text - string to parse
@returns {Object[]} the string split into a list [{matched:bool, substring:string}, ...]
*/
function segment(reg, text){
  // todo: do I need to reset reg.lastIndex somehow to guard against reuse?
  var segments = [];
  var copiedIndex = 0;
  while (1){
    var match = reg.exec(text);
    if (!match) break;
    var a = match.index, b = reg.lastIndex;
    if (a > copiedIndex){
      segments.push({
        matched: false,
        substring: text.slice(copiedIndex, a)
      });
    }
    segments.push({
      matched: true,
      substring: text.slice(a, b)
    })
    copiedIndex = b;
  }
  if (text.length > copiedIndex) segments.push({
    matched: false,
    substring: text.slice(copiedIndex)
  });
  return segments;
}

/**
renderer to pass to Wino
@param {string} text
@returns {Node} as HTML with hash tags turned into wikipedia links
*/
function renderTags(text){
  var segments = segment(/\#\w+\b/g, text);
  var elt = document.createElement('div');
  segments.map(function(seg){
    var child;
    if (seg.matched){
      child = document.createElement('a');
      child.style.pointerEvents = 'auto';
      child.textContent = seg.substring;
      child.href = 'https://en.wikipedia.org/wiki/' + seg.substring.slice(1);
    }
    else {
      child = document.createTextNode(seg.substring);
    }
    elt.appendChild(child);
  });
  return elt;
}
