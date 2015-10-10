'use strict';

var util = require('util');
var Reduction = require('json-pipeline-reducer').Reduction;

function GVN() {
  Reduction.call(this);

  this.relations = [];
  this.hashes = null;
  this.space = null;
}
util.inherits(GVN, Reduction);
module.exports = GVN;

GVN.Relation = require('./relation');

GVN.create = function create() {
  return new GVN();
};

GVN.prototype.addRelation = function addRelation(relation) {
  this.relations.push(relation);
};

GVN.prototype.hash = function hash(value, acc) {
  var res;

  if (this.hashes.has(value)) {
    res = this.hashes.get(value);
  } else {
    res = this.hashes.size;
    this.hashes.set(value, res);
  }

  // Variation, based on jenkins hash
  res = (acc + (res << 10)) ^ (res >>> 6);

  return res;
};

GVN.prototype.start = function start() {
  this.space = new Array(this.relations.length);
  for (var i = 0; i < this.space.length; i++)
    this.space[i] = [];
  this.hashes = new Map();
};

GVN.prototype.reduce = function reduce(node, reducer) {
  for (var i = 0; i < this.relations.length; i++) {
    var relation = this.relations[i];

    var hash = relation.hash(node, this);
    if (hash === undefined)
      continue;

    var space = this.space[i];
    if (!space[hash]) {
      space[hash] = [ node ];
      continue;
    }

    var list = space[hash];
    for (var j = 0; j < list.length; j++) {
      var existing = list[j];

      // Node was removed, no point in iterating it over and over again
      if (existing.index === -1) {
        list.splice(j, 1);
        j--;
        continue;
      }

      if (node === existing)
        continue;

      if (!relation.areCongruent(node, existing, this))
        continue;

      reducer.replace(node, existing);
      break;
    }

    if (j !== list.length)
      break;

    list.push(node);
  }
};

GVN.prototype.end = function end() {
  this.space = null;
  this.hashes = null;
};
