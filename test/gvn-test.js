'use strict';

var fixtures = require('./fixtures');

var GVN = require('../');

describe('GVN', function() {
  var gvn;
  beforeEach(function() {
    gvn = GVN.create();
  });

  describe('SameOpcodeAndInput', function() {
    beforeEach(function() {
      gvn.addRelation(new fixtures.SameOpcodeAndInput());
    });
    it('should replace same literals', function() {
      fixtures.test(gvn, function() {/*
        pipeline {
          b0 {
            i0 = literal 1
            i1 = literal 1
            i2 = literal 2
            i3 = literal 3
            i4 = ret ^b0, i1
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = literal 1
            i1 = literal 2
            i2 = literal 3
            i3 = ret ^b0, i0
          }
        }
      */});
    });
  });

  describe('SwapAdd', function() {
    beforeEach(function() {
      gvn.addRelation(new fixtures.SwapAdd());
    });
    it('should replace addition with the same inputs', function() {
      fixtures.test(gvn, function() {/*
        pipeline {
          b0 {
            i0 = literal 1
            i1 = literal 2
            i2 = add i0, i1
            i3 = add i1, i0
            i4 = add i1, i1
            i5 = ret ^b0, i3
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = literal 1
            i1 = literal 2
            i2 = add i0, i1
            i3 = add i1, i1
            i4 = ret ^b0, i2
          }
        }
      */});
    });
  });
});
