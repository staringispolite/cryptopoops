// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './CryptoPoops.sol';

// Simply exists to expose the internal functions for testing.
contract TestableCryptoPoops is CryptoPoops {
  constructor(string memory baseURI) CryptoPoops(baseURI) {
    
  }

  // @dev Tetsing only: to get to max supply. Ganache can't handle
  // 6006 in one transaction (probably hitting some EVM stack limit
  function _test_mint500() public {
    uint256 toMint = 500;
    uint256 i = 0;
    while (i < toMint && totalSupply() < MAX_POOPS) {
      _mint(msg.sender, nextTokenId++);
    }
  }

  // @dev note: call _test_mint500() first in tests to reach the max
  function _test_reRollTraits(uint256 _tokenId, uint8 _boost) public payable {
    reRollTraits(_tokenId, _boost);
  }
}
