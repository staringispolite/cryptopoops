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
  uint8 internal constant BACKGROUND = 0;
  uint8 internal constant BACK_ACCESSORIES = 1;
  uint8 internal constant BODIES = 2;
  uint8 internal constant COLORS = 3;
  uint8 internal constant FACES = 4;
  uint8 internal constant FRONT_ACCESSORIES = 5;
  uint8 internal constant NUM_CATEGORIES = 6;

  // ALL options within each category
  // Number of background options is CATEGORY_OPTIONS[BACKGROUND]
  // @dev hard-coding the number of categories because the compiler needs
  // it to be in memory in order to use even an immutable variable.
  uint8[6] internal CATEGORY_OPTIONS = [
    uint8(10),  // Backgrounds
    uint8(20),  // Back accessories
    uint8(3),   // Bodies
    uint8(5),   // Colors
    uint8(30),  // Faces
    uint8(20)   // Front accessories
  ];

  // List the option numbers that fall into each category in each rarity level
  // @dev uint8[NUM_LEVELS][NUM_CATEGORIES] = [1, 3, 10, 12];
  /*
  uint8[NUM_LEVELS][] internal immutable backgroundOptions = [
    [0,2,3,9],
    [1,4,10],
    [5,8],
    [6,7]
  ];
  uint8[NUM_LEVELS] internal immutable backAccessoryOptions = [
    [0,2,3,9],
    [1,4,10],
    [5,8],
    [6,7]
  ];
  uint8[NUM_LEVELS] internal immutable bodyOptions = [
    [0,2,3,9],
    [1,4,10],
    [5,8],
    [6,7]
  ];
  uint8[NUM_LEVELS] internal immutable colorOptions = [
    [0,2,3,9],
    [1,4,10],
    [5,8],
    [6,7]
  ];
  uint8[NUM_LEVELS] internal immutable faceOptions = [
    [0,2,3,9],
    [1,4,10],
    [5,8],
    [6,7]
  ];
  uint8[NUM_LEVELS] internal immutable frontAccessoryOptions = [
    [0,2,3,9],
    [1,4,10],
    [5,8],
    [6,7]
  ];
  uint8[NUM_CATEGORIES][NUM_LEVELS][] internal immutable traitLookup = [
    backgroundOptions,
    backAccessoryOptions,
    bodyOptions,
    colorOptions,
    faceOptions,
    frontAccessoryOptions
  ];
  */

  uint internal nonce = 0;

  function randomLevel() internal returns(uint8) {
    uint randomNumber = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % NUM_LEVELS;
    nonce++;
    return uint8(randomNumber);
  }

  // traitLookup[_level][_category] contains an array of IDs for this level and category
  // eg. we might have rare backgrounds defined as 1.png, 2.png, and 21.png
  // in that case, traitLookup[RARE][BACKGROUNDS] yields [1, 2, 21];
  function randomTrait(uint8 _level, uint8 _category) internal returns(uint8) {
    uint8 numOptions = 1;  // traitLookup[_level][_category].length;
    uint randomNumber = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % numOptions;
    uint randomOptionId = 1;  // traitLookup[_level][_category][randomNumber];
    nonce++;
    return uint8(randomOptionId);
  }
}
