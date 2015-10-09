'use strict';

function Relation() {
}
module.exports = Relation;

Relation.prototype.tag = function tag() {
  // To be overridden
};

Relation.prototype.areCongruent = function areCongruent() {
  // To be overriden
  return false;
};
