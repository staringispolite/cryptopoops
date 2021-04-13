// contracts/CryptoPoops.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

// OpenZeppelin
import "./token/ERC721/ERC721.sol";
import "./access/Ownable.sol";
import "./access/AccessControl.sol";
import "./security/ReentrancyGuard.sol";

import "./CryptoPoopTraits.sol"; 

// Inspired/Copied from BGANPUNKS V2 (bastardganpunks.club)
// and the lovable justice-filled Chubbies (chubbies.io)
contract CryptoPoops is CryptoPoopTraits, ERC721, AccessControl, ReentrancyGuard {
  using SafeMath for uint8;
  using SafeMath for uint256;

  uint public constant MAX_POOPS = 6006;
  bool public hasSaleStarted = false;
  uint internal nextTokenId = 0;

  uint internal reRollPriceInWei = 80000000000000000;

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
    require(totalSupply() < MAX_POOPS,
            "We are at max supply. Burn some in a paper bag...?");

    uint currentSupply = totalSupply();
    if (currentSupply >= 9900) {
      return 690000000000000000;         // 9500-9500:  0.69 ETH
    } else if (currentSupply >= 7500) {
      return 420000000000000000;         // 7500-9500:  0.420 ETH
    } else if (currentSupply >= 3500) {
      return 190000000000000000;         // 3500-7500:  0.19 ETH
    } else if (currentSupply >= 1500) {
      return 80000000000000000;          // 1500-3500:  0.08 ETH 
    } else if (currentSupply >= 500) {
      return 40000000000000000;          // 500-1500:   0.04 ETH 
    } else {
      return 20000000000000000;          // 0 - 500     0.02 ETH
    }
  }

  function calculatePriceForToken(uint _id) external view returns (uint256) {
    require(totalSupply() < MAX_POOPS,
            "We are at max supply. Burn some in a paper bag...?");

    if (_id >= 9900) {
      return 690000000000000000;         // 9500-9500:  0.69 ETH
    } else if (_id >= 7500) {
      return 420000000000000000;         // 7500-9500:  0.420 ETH
    } else if (_id >= 3500) {
      return 190000000000000000;         // 3500-7500:  0.19 ETH
    } else if (_id >= 1500) {
      return 80000000000000000;          // 1500-3500:  0.08 ETH 
    } else if (_id >= 500) {
      return 40000000000000000;          // 500-1500:   0.04 ETH 
    } else {
      return 20000000000000000;          // 0 - 500     0.02 ETH
    }
  }

  function reRollPrice() external view returns (uint256) {
    return reRollPriceInWei;
  }

  function dropPoops(uint256 numCryptoPoops) external payable nonReentrant {
    require(totalSupply() < MAX_POOPS,
           "We are at max supply. Burn some in a paper bag...?");
    require(numCryptoPoops > 0 && numCryptoPoops <= 20, "You can drop minimum 1, maximum 20 CryptoPoops");
    require(totalSupply().add(numCryptoPoops) <= MAX_POOPS, "Exceeds MAX_POOPS");
    require(msg.value >= calculatePrice().mul(numCryptoPoops), "Ether value sent is below the price");

    for (uint i = 0; i < numCryptoPoops; i++) {
      uint mintId = nextTokenId++;
      _safeMintWithTraits(msg.sender, mintId, 0);
    }
  }

  // @dev Combine minting and trait generation in one place, so all CryptoPoops
  // get assigned traits correctly.
  function _safeMintWithTraits(address _to, uint256 _mintId, uint8 _boost) internal {
    _safeMint(_to, _mintId);

    uint64 encodedTraits = _assignTraits(_mintId, _boost);
    emit TraitAssigned(_to, _mintId, encodedTraits);
  }

  function _assignTraits(uint256 _tokenId, uint8 _boost) internal returns (uint64) {
    uint8[NUM_CATEGORIES] memory assignedTraits;
    uint8 rarityLevel;

    for (uint8 i = 0; i < NUM_CATEGORIES; i++) {
      rarityLevel = randomLevel() + _boost;
      if (rarityLevel >= NUM_LEVELS) {
        rarityLevel = NUM_LEVELS - 1;
      }
      assignedTraits[i] = randomTrait(rarityLevel, i);
    }

    uint64 encodedTraits = encodeTraits(assignedTraits);
    _tokenTraits[_tokenId] = encodedTraits;
    return encodedTraits;
  }

  function reRollTraits(uint256 _tokenId, uint8 _boost) public payable nonReentrant {
    require(msg.value >= reRollPriceInWei, "Not enough ETH sent. Check re-roll price");
    require(_exists(_tokenId), "Token doesn't exist");
    require(msg.sender == ERC721.ownerOf(_tokenId), "Only token owner can re-roll");
    require(totalSupply() >= MAX_POOPS, "Re-rolls will unlock at max supply!");
    // TODO: Check they're using an authorized amt of boost
    // TODO: how to whitelist smart contracts for this?

    uint64 encodedTraits = _assignTraits(_tokenId, _boost);
    emit TraitAssigned(msg.sender, _tokenId, encodedTraits);
  }

  function traitsOf(uint256 tokenId) external view returns (uint64) {
    require(_exists(tokenId), "Traits query for nonexistent token");
    return _tokenTraits[tokenId];
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
      _safeMint(owner(), currentSupply + index);
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
