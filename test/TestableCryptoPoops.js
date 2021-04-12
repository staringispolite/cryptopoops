var chai = require('chai');
var expect = chai.expect;

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

//const testCryptoPoopTraits = artifacts.require('TestableCryptoPoops');
const utils = require('./helpers/util');

contract("TestableCryptoPoops", async (accounts) => {
  let [owner, alice, bob] = accounts;

});
