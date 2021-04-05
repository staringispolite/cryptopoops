// contracts/CryptoPoopsTraits.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./math/SafeMath.sol";

contract CryptoPoopTraits {
  using SafeMath for uint256;
  using SafeMath for uint8;

  // Levels of rarity
  uint8 internal constant COMMON = 0;
  uint8 internal constant UNCOMMON = 1;
  uint8 internal constant RARE = 2;
  uint8 internal constant LEGENDARY = 3;
  uint8 internal constant NUM_LEVELS = 4;

  // Categories within which we'll randomly assign
  uint8 internal constant BACKGROUNDS = 0;
  uint8 internal constant BACK_ACCESSORIES = 1;
  uint8 internal constant BODIES = 2;
  uint8 internal constant FACES = 3;
  uint8 internal constant FRONT_ACCESSORIES = 4;
  uint8 internal constant NUM_CATEGORIES = 5;

  // List the option numbers that fall into each category in each rarity level
  uint8[][NUM_LEVELS] internal backgroundOptions;
  uint8[][NUM_LEVELS] internal backAccessoryOptions;
  uint8[][NUM_LEVELS] internal bodyOptions;
  uint8[][NUM_LEVELS] internal faceOptions;
  uint8[][NUM_LEVELS] internal frontAccessoryOptions;

  // traitLookup[category][level][i] = an optionId
  uint8[][NUM_LEVELS][NUM_CATEGORIES] internal traitLookup;

  uint internal traitNonce = 0;

  // Mapping from token ID to encoded trait
  mapping (uint256 => uint64) internal _tokenTraits;

  event TraitAssigned(address indexed tokenOwner, uint256 tokenId, uint64 encodedTraits);

  constructor() {
    // Initialize lookup data
    backgroundOptions[COMMON] = [uint8(0), 2, 3, 9];
    backgroundOptions[UNCOMMON] = [uint8(1), 4, 10];
    backgroundOptions[RARE] = [uint8(5), 8];
    backgroundOptions[LEGENDARY] = [uint8(6), 7];
    backAccessoryOptions[COMMON] = [uint8(0), 2, 3, 9];
    backAccessoryOptions[UNCOMMON] = [uint8(1), 4, 10];
    backAccessoryOptions[RARE] = [uint8(5), 8];
    backAccessoryOptions[LEGENDARY] = [uint8(6), 7];
    bodyOptions[COMMON] = [uint8(0), 2, 3, 9];
    bodyOptions[UNCOMMON] = [uint8(1), 4, 10];
    bodyOptions[RARE] = [uint8(5), 8];
    bodyOptions[LEGENDARY] = [uint8(6), 7];
    faceOptions[COMMON] = [uint8(0), 2, 3, 9];
    faceOptions[UNCOMMON] = [uint8(1), 4, 10];
    faceOptions[RARE] = [uint8(5), 8];
    faceOptions[LEGENDARY] = [uint8(6), 7];
    frontAccessoryOptions[COMMON] = [uint8(0), 2, 3, 9];
    frontAccessoryOptions[UNCOMMON] = [uint8(1), 4, 10];
    frontAccessoryOptions[RARE] = [uint8(5), 8];
    frontAccessoryOptions[LEGENDARY] = [uint8(6), 7];

    traitLookup = [
      backgroundOptions,
      backAccessoryOptions,
      bodyOptions,
      faceOptions,
      frontAccessoryOptions
    ];
  }

  function randomLevel() internal returns(uint8) {
    uint randomNumber = uint(keccak256(abi.encodePacked(
      block.timestamp, msg.sender, block.number, traitNonce))) % NUM_LEVELS;
    traitNonce++;
    return uint8(randomNumber);
  }

  // traitLookup[_category][_level] contains an array of IDs for this level and category
  // eg. we might have rare backgrounds defined as 1.png, 2.png, and 21.png
  // in that case, traitLookup[BACKGROUNDS][RARE] yields [1, 2, 21];
  function randomTrait(uint8 _level, uint8 _category) internal returns(uint8) {
    uint numOptions =  traitLookup[_category][_level].length;
    uint randomNumber = uint(keccak256(abi.encodePacked(
      block.timestamp, msg.sender, block.number, traitNonce))) % numOptions;
    uint randomOptionId = traitLookup[_category][_level][randomNumber];
    traitNonce++;
    return uint8(randomOptionId);
  }

  // @dev an encoded uint64 that can store up to 8 distinct categories of max 32 options each
  // Currently, our structure is the following:
  //
  // | unused byte | unused byte | unused byte | front acc | faces | bodies | back acc | backgrounds |
  function encodeTraits(uint8[NUM_CATEGORIES] memory _traits) internal pure returns(uint64) {
    uint64 encodedTraits= 0;
    for (uint32 i; i < NUM_CATEGORIES; i++) {
      uint64 chunk = uint64(_traits[i]);
      encodedTraits |= (chunk << (8 * i));
    }
    return encodedTraits;
  }
}
