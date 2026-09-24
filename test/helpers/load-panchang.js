'use strict';

const path = require('node:path');

// panchang.js / festivals.js are plain `(function (window) {...})(window)` browser
// scripts (loaded via <script> tags in newtab.html, in this order). We give them a
// `window` global backed by `global` itself so their `window.X = ...` exports land
// where we can read them back, then load them in the same order the extension does.
global.window = global;
window.Astronomy = require(path.join(__dirname, '..', '..', 'lib', 'astronomy.js'));
require(path.join(__dirname, '..', '..', 'lib', 'tz.js'));
require(path.join(__dirname, '..', '..', 'panchang.js'));
require(path.join(__dirname, '..', '..', 'festivals.js'));

module.exports = { Panchang: window.Panchang, Festivals: window.Festivals };
