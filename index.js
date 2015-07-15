/**
@module index
npm entry point. used by browserify for generating dist/ builds.
Don't use this if you're using require() to access the Wino object.
*/

global.Swapper = require('components/swapper').Swapper;
global.Wino = require('components/wino').Wino;
