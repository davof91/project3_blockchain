pragma solidity ^0.6.0;

import "../../node_modules/@openzeppelin/contracts/access/AccessControl.sol";

contract UserRoles is AccessControl {
    bytes32 public constant CONSUMER_ROLE = keccak256("CONSUMER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    constructor() public {
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function getUsersRoles(uint roleNum) public view returns (address[] memory) {
        if(roleNum == 0){
            uint memberCount = getRoleMemberCount(FARMER_ROLE);
            address[] memory addressIndices = new address[](memberCount);
            for (uint i=0; i<memberCount; i++) {
                addressIndices[i] = getRoleMember(FARMER_ROLE, i);
            }
            return addressIndices;
        } else if(roleNum == 1){
            uint memberCount = getRoleMemberCount(DISTRIBUTOR_ROLE);
            address[] memory addressIndices = new address[](memberCount);
            for (uint i=0; i<memberCount; i++) {
                addressIndices[i] = getRoleMember(DISTRIBUTOR_ROLE, i);
            }
            return addressIndices;
        } else if(roleNum == 2){
            uint memberCount = getRoleMemberCount(RETAILER_ROLE);
            address[] memory addressIndices = new address[](memberCount);
            for (uint i=0; i<memberCount; i++) {
                addressIndices[i] = getRoleMember(RETAILER_ROLE, i);
            }
            return addressIndices;
        } else if(roleNum == 3){
            uint memberCount = getRoleMemberCount(CONSUMER_ROLE);
            address[] memory addressIndices = new address[](memberCount);
            for (uint i=0; i<memberCount; i++) {
                addressIndices[i] = getRoleMember(CONSUMER_ROLE, i);
            }
            return addressIndices;
        }
        
    }

    // Admin functions!!!
    function addAdmin(address user) public{
        grantRole(DEFAULT_ADMIN_ROLE, user);
    }

    function removeAdmin(address user) public {
        revokeRole(DEFAULT_ADMIN_ROLE, user);
    }

    function checkAdmin(address user) public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, user);
    }

    // Costumer Functions!!!
    function addConsumer(address user) public{
        grantRole(CONSUMER_ROLE, user);
    }

    function removeConsumer(address user) public {
        revokeRole(CONSUMER_ROLE, user);
    }

    function checkConsumer(address user) view public returns (bool) {
        return hasRole(CONSUMER_ROLE, user);
    }

    // Distributor Functions!!!!
    function addDistributor(address user) public{
        grantRole(DISTRIBUTOR_ROLE, user);
    }

    function removeDistributor(address user) public {
        revokeRole(DISTRIBUTOR_ROLE, user);
    }

    function checkDistributor(address user) view public returns (bool) {
        return hasRole(DISTRIBUTOR_ROLE, user);
    }

    // Farmer Functions!!!
    function addFarmer(address user) public{
        grantRole(FARMER_ROLE, user);
    }

    function removeFarmer(address user) public {
        revokeRole(FARMER_ROLE, user);
    }

    function checkFarmer(address user) view public returns (bool) {
        return hasRole(FARMER_ROLE, user);
    }

    // Adding Retailer Role to user
    function addRetailer(address user) public{
        grantRole(RETAILER_ROLE, user);
    }

    function removeRetailer(address user) public {
        revokeRole(RETAILER_ROLE, user);
    }

    function checkRetailer(address user) view public returns (bool) {
        return hasRole(RETAILER_ROLE, user);
    }
}