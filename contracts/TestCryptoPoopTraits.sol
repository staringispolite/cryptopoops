// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './CryptoPoopTraits.sol';

// Simply exists to expose the internal functions for testing.
contract TestCryptoPoopTraits is CryptoPoopTraits {
  constructor() public {
    
  }
  
  function _test_randomLevel() public returns(uint8) {
    return randomLevel();
  }

  function _test_randomTrait(uint8 _level, uint8 _category) public returns(uint8) {
    return randomTrait(_level, _category);
  }
}
