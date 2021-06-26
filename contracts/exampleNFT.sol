// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// @author: bighead.club

import "./core/IERC721CreatorCore.sol";
import "./extensions/ICreatorExtensionTokenURI.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @dev description/purpose here
 */
contract ExampleNFT is Ownable, ERC165, ICreatorExtensionTokenURI {

    using Strings for uint256;
    
    address private _creator;
    uint16 private _minted;
    mapping(uint256 => uint16) _tokenEdition;

    constructor(address creator) {
        _creator = creator;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(IERC165, ERC165) returns (bool) {
        return interfaceId == type(ICreatorExtensionTokenURI).interfaceId || super.supportsInterface(interfaceId);
    }

    function tokenURI(address creator, uint256 tokenId) external view override returns (string memory) {
        require(creator == _creator && _tokenEdition[tokenId] != 0, "Invalid token");
        // @dev - either return a hard-coded metadata string
        // eg. https://etherscan.io/address/0xbe7af1eac36bde14e09ab50c670b7988d3509fab#contracts
        return string(abi.encodePacked('data:application/json;utf8,{"name":"", "created_by":"", "description":"", "image":"","attributes":[{"trait_type":"Artist","value":""},{"display_type":"number","trait_type":"Edition","value":',uint256(_tokenEdition[tokenId]).toString(),',"max_value":500}]}'));
        // or a URL that resolves to a JSON metadata description like a fission.codes directory, eg.
        // return string(abi.encodePacked('sub-directory-of-project.fission.app/json/',tokenId));
    }

    function airdrop(address[] calldata receivers) external onlyOwner {
        require(_minted+receivers.length <= 500, "Only 500 available");
        for (uint i = 0; i < receivers.length; i++) {
            _minted += 1;
            _tokenEdition[IERC721CreatorCore(_creator).mintExtension(receivers[i])] = _minted;
        }
    }
}
