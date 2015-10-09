'use strict';

function Relation() {
}
module.exports = Relation;

Relation.prototype.hash = function hash() {
  // To be overridden
};

Relation.prototype.areCongruent = function areCongruent() {
  // To be overriden
  return false;
};
