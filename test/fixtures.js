'use strict';

var assert = require('assert');
var assertText = require('assert-text');
assertText.options.trim = true;

var util = require('util');
var Pipeline = require('json-pipeline');
var Reducer = require('json-pipeline-reducer');

var GVN = require('../');

exports.fn2str = function fn2str(fn) {
  return fn.toString().replace(/^function[^{]+{\/\*|\*\/}$/g, '');
};

exports.test = function test(gvn, input, expected) {
  input = exports.fn2str(input);
  expected = exports.fn2str(expected);

  var p = Pipeline.create('cfg');
  p.parse(input, { cfg: true }, 'printable');

  var r = new Reducer();
  r.addReduction(gvn);
  r.reduce(p);

  p.reindex();
  assertText.equal(p.render({ cfg: true }, 'printable'), expected);
};

function SameOpcodeAndInput() {
  GVN.Relation.call(this);
}
exports.SameOpcodeAndInput = SameOpcodeAndInput;
util.inherits(SameOpcodeAndInput, GVN.Relation);

SameOpcodeAndInput.prototype.hash = function hash(node, gvn) {
  var hash = gvn.hash(node.opcode, 0);
  for (var i = 0; i < node.inputs.length; i++)
    hash = gvn.hash(node.inputs[i], hash);
  for (var i = 0; i < node.literals.length; i++)
    hash = gvn.hash(node.literals[i], hash);
  return hash;
};

SameOpcodeAndInput.prototype.areCongruent = function areCongruent(a, b) {
  if (a.isControl() || b.isControl())
    return false;

  if (a.opcode !== b.opcode)
    return false;

  if (a.inputs.length !== b.inputs.length ||
      a.literals.length !== b.literals.length) {
    return false;
  }

  for (var i = 0; i < a.inputs.length; i++)
    if (a.inputs[i] !== b.inputs[i])
      return false;

  for (var i = 0; i < a.literals.length; i++)
    if (a.literals[i] !== b.literals[i])
      return false;

  return true;
};

function SwapAdd() {
  GVN.Relation.call(this);
}
exports.SwapAdd = SwapAdd;
util.inherits(SwapAdd, GVN.Relation);

SwapAdd.prototype.hash = function hash(node, gvn) {
  if (node.opcode !== 'add')
    return undefined;

  var left = node.inputs[0];
  var right = node.inputs[1];
  return gvn.hash(left, 0) ^ gvn.hash(right, 0);
};

SwapAdd.prototype.areCongruent = function areCongruent(a, b) {
  return (a.inputs[0] === b.inputs[0] && a.inputs[1] === b.inputs[1]) ||
         (a.inputs[0] === b.inputs[1] && a.inputs[1] === b.inputs[0]);
};
