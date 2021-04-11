// contracts/CryptoPoops.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./token/ERC721/ERC721.sol";  // OpenZeppelin
import "./access/Ownable.sol";  // OpenZeppelin
import "./access/AccessControl.sol";  // OpenZeppelin

import "./CryptoPoopTraits.sol"; 

// Inspired/Copied from BGANPUNKS V2 (bastardganpunks.club)
// and the lovable justice-filled Chubbies (chubbies.io)
contract CryptoPoops is CryptoPoopTraits, ERC721, AccessControl {
  using SafeMath for uint256;
  uint public constant MAX_POOPS = 6006;
  bool public hasSaleStarted = false;

  // TODO: The IPFS hash for all CryptoPoops concatenated *might* stored here once all CryptoPoops are issued and if I figure it out
  string public METADATA_PROVENANCE_HASH = "";

  constructor(string memory baseURI) ERC721("CryptoPoops","POOPS")  {
    setBaseURI(baseURI);
  }

  function tokensOfOwner(address _owner) external view returns(uint256[] memory ) {
    uint256 tokenCount = balanceOf(_owner);
    if (tokenCount == 0) {
      // Return an empty array
      return new uint256[](0);
    } else {
      uint256[] memory result = new uint256[](tokenCount);
      uint256 index;
      for (index = 0; index < tokenCount; index++) {
        result[index] = tokenOfOwnerByIndex(_owner, index);
      }
      return result;
    }
  }

  function calculatePrice() public view returns (uint256) {
    require(hasSaleStarted == true, "Sale hasn't started");
    require(totalSupply() < MAX_POOPS, "Sale has already ended");

    uint currentSupply = totalSupply();
    if (currentSupply >= 9900) {
      return 1000000000000000000;        // 9900-10000: 1.00 ETH
    } else if (currentSupply >= 9500) {
      return 640000000000000000;         // 9500-9500:  0.64 ETH
    } else if (currentSupply >= 7500) {
      return 320000000000000000;         // 7500-9500:  0.32 ETH
    } else if (currentSupply >= 3500) {
      return 160000000000000000;         // 3500-7500:  0.16 ETH
    } else if (currentSupply >= 1500) {
      return 80000000000000000;          // 1500-3500:  0.08 ETH 
    } else if (currentSupply >= 500) {
      return 40000000000000000;          // 500-1500:   0.04 ETH 
    } else {
      return 20000000000000000;          // 0 - 500     0.02 ETH
    }
  }

  function calculatePriceForToken(uint _id) public pure returns (uint256) {
    require(_id < MAX_POOPS, "Sale has already ended");

    if (_id >= 9900) {
      return 1000000000000000000;        // 9900-10000: 1.00 ETH
    } else if (_id >= 9500) {
      return 640000000000000000;         // 9500-9500:  0.64 ETH
    } else if (_id >= 7500) {
      return 320000000000000000;         // 7500-9500:  0.32 ETH
    } else if (_id >= 3500) {
      return 160000000000000000;         // 3500-7500:  0.16 ETH
    } else if (_id >= 1500) {
      return 80000000000000000;          // 1500-3500:  0.08 ETH 
    } else if (_id >= 500) {
      return 40000000000000000;          // 500-1500:   0.04 ETH 
    } else {
      return 20000000000000000;          // 0 - 500     0.02 ETH
    }
  }

  function dropPoops(uint256 numCryptoPoops) public payable {
    require(totalSupply() < MAX_POOPS, "Sale has already ended");
    require(numCryptoPoops > 0 && numCryptoPoops <= 20, "You can drop minimum 1, maximum 20 CryptoPoops");
    require(totalSupply().add(numCryptoPoops) <= MAX_POOPS, "Exceeds MAX_POOPS");
    require(msg.value >= calculatePrice().mul(numCryptoPoops), "Ether value sent is below the price");

    for (uint i = 0; i < numCryptoPoops; i++) {
      uint mintIndex = totalSupply();
      _safeMintWithTraits(msg.sender, mintIndex, 0);
    }
  }

  // TODO: Make boost something that gets assigned (along with AccessControl?) and lives with Traits
  // @dev Combine minting and trait generation in one place, so all CryptoPoops
  // get assigned traits correctly.
  function _safeMintWithTraits(address _to, uint256 _mintIndex, uint8 _boost) internal {
    _safeMint(_to, _mintIndex);

    uint8[NUM_CATEGORIES] memory assignedTraits;
    uint8 rarityLevel;

    for (uint8 i; i < NUM_CATEGORIES; i++) {
      rarityLevel = randomLevel() + _boost;
      if (rarityLevel >= NUM_LEVELS) {
        rarityLevel = NUM_LEVELS - 1;
      }
      assignedTraits[i] = randomTrait(rarityLevel, i);
    }

    uint64 encodedTraits = encodeTraits(assignedTraits);
    _tokenTraits[_mintIndex] = encodedTraits;
    emit TraitAssigned(_to, _mintIndex, encodedTraits);
  }

  // God Mode
  function setProvenanceHash(string memory _hash) public onlyOwner {
    METADATA_PROVENANCE_HASH = _hash;
  }

  function setBaseURI(string memory baseURI) public onlyOwner {
    _setBaseURI(baseURI);
  }

  function startSale() public onlyOwner {
    hasSaleStarted = true;
  }
  function pauseSale() public onlyOwner {
    hasSaleStarted = false;
  }

  function withdrawAll() public payable onlyOwner {
    require(payable(msg.sender).send(address(this).balance));
  }

  function reserveGiveaway(uint256 numCryptoPoops) public onlyOwner {
    uint currentSupply = totalSupply();
    require(totalSupply().add(numCryptoPoops) <= 69, "Exceeded giveaway supply");
    require(hasSaleStarted == false, "Sale has already started");
    uint256 index;
    // Reserved for people who helped this project and giveaways
    for (index = 0; index < numCryptoPoops; index++) {
      // TODO: these will be 1 of 1's. Remove traits
      _safeMintWithTraits(owner(), currentSupply + index, 0);
    }
  }

  // ERC 165
  // TODO: Can we save gas by going into ERC165.sol and making this external view?
  function supportsInterface(bytes4 interfaceID) public pure override(AccessControl, ERC165) returns (bool) {
    // Finalize the interface and implement this for real
    return ((interfaceID != 0xffffffff) &&  // Return false for this, per spec
            (interfaceID ^ 0x80ac58cd > 0)); // non-optional ERC-721 functions
  }

}

// TODO: Delete this after calculating on the dev chain locally
contract Selector {
  // Calculate XOR of all function selectors
  function calculateSelector() public pure returns (bytes4) {
    CryptoPoops cp;
    return cp.supportsInterface.selector ^ 
      cp.balanceOf.selector ^ cp.ownerOf.selector ^ cp.approve.selector;
  }  
}
