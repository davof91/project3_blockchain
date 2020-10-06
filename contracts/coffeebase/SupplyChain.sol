pragma solidity ^0.6.0;
// pragma experimental ABIEncoderV2;

import "../coffeeaccesscontrol/UserRoles.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

// Define a contract 'Supplychain'
contract SupplyChain is UserRoles, Ownable {

  // Define 'owner'
  // address payable owner;

  // Define a variable called 'upc' for Universal Product Code (UPC)
  uint  upc;

  // Define a variable called 'sku' for Stock Keeping Unit (SKU)
  uint  sku;

  // Define a public mapping 'items' that maps the UPC to an Item.
  mapping (string => Item) items;

  // all items
  // string[] itemsUPC;
  
  // Define enum 'State' with the following values:
  enum State 
  { 
    Harvested,  // 0
    Processed,  // 1
    Packed,     // 2
    ForSale,    // 3
    Sold,       // 4
    Shipped,    // 5
    Received,   // 6
    Purchased   // 7
    }

  State constant defaultState = State.Harvested;

  // Define a struct 'Item' with the following fields:
  struct Item {
    uint    sku;  // Stock Keeping Unit (SKU)
    uint    upc; // Universal Product Code (UPC), generated by the Farmer, goes on the package, can be verified by the Consumer
    address ownerID;  // Metamask-Ethereum address of the current owner as the product moves through 8 stages
    address payable originFarmerID; // Metamask-Ethereum address of the Farmer
    string  originFarmName; // Farmer Name
    string  originFarmInformation;  // Farmer Information
    string  originFarmLatitude; // Farm Latitude
    string  originFarmLongitude;  // Farm Longitude
    uint    productID;  // Product ID potentially a combination of upc + sku
    string  productNotes; // Product Notes
    uint    productPrice; // Product Price
    State   itemState;  // Product State as represented in the enum above
    address payable distributorID;  // Metamask-Ethereum address of the Distributor
    address payable retailerID; // Metamask-Ethereum address of the Retailer
    address payable consumerID; // Metamask-Ethereum address of the Consumer
    string  ipfsHash;
    string  itemHash;
  }

  // Define 8 events with the same 8 state values and accept 'upc' as input argument
  event Harvested(string upc);
  event Processed(string upc);
  event Packed(string upc);
  event ForSale(string upc);
  event Sold(string upc);
  event Shipped(string upc);
  event Received(string upc);
  event Purchased(string upc);

  // Define a modifer that checks to see if msg.sender == owner of the contract
  // modifier onlyOwner() {
  //   require(msg.sender == owner);
  //   _;
  // }

  // Define a modifer that verifies the Caller
  modifier verifyCaller (address _address) {
    require(msg.sender == _address); 
    _;
  }

  // Define a modifier that checks if the paid amount is sufficient to cover the price
  modifier paidEnough(uint _price) { 
    require(msg.value >= _price); 
    _;
  }

  // Define a modifier that checks the price and refunds the remaining balance
  modifier checkValueRetailer(string memory _upc) {
    _;
    uint _price = items[_upc].productPrice;
    uint amountToReturn = msg.value - _price;
    items[_upc].retailerID.transfer(amountToReturn);
  }

  // Define a modifier that checks the price and refunds the remaining balance
  modifier checkValueDistributor(string memory _upc) {
    _;
    uint _price = items[_upc].productPrice;
    uint amountToReturn = msg.value - _price;
    items[_upc].distributorID.transfer(amountToReturn);
  }
  
  // Define a modifier that checks the price and refunds the remaining balance
  modifier checkValueConsumer(string memory _upc) {
    _;
    uint _price = items[_upc].productPrice;
    uint amountToReturn = msg.value - _price;
    items[_upc].consumerID.transfer(amountToReturn);
  }

  // Define a modifier that checks if an item.state of a upc is Harvested
  modifier harvested(string memory _upc) {
    require(items[_upc].itemState == State.Harvested);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Processed
  modifier processed(string memory _upc) {
    require(items[_upc].itemState == State.Processed);
    _;
  }
  
  // Define a modifier that checks if an item.state of a upc is Packed
  modifier packed(string memory _upc) {
    require(items[_upc].itemState == State.Packed);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is ForSale
  modifier forSale(string memory _upc) {
    require(items[_upc].itemState == State.ForSale);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Sold
  modifier sold(string memory _upc) {
    require(items[_upc].itemState == State.Sold);
    _;
  }
  
  // Define a modifier that checks if an item.state of a upc is Shipped
  modifier shipped(string memory _upc) {
    require(items[_upc].itemState == State.Shipped);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Received
  modifier received(string memory _upc) {
    require(items[_upc].itemState == State.Received);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Purchased
  modifier purchased(string memory _upc) {
    require(items[_upc].itemState == State.Purchased);    
    _;
  }

  // In the constructor set 'owner' to the address that instantiated the contract
  // and set 'sku' to 1
  // and set 'upc' to 1
  constructor() public payable {
    sku = 1;
    upc = 1;
  }

  // function getItemsUPC() public returns (string[] memory) {
  //   return itemsUPC;
  // }

  // Define a function 'harvestItem' that allows a farmer to mark an item 'Harvested'
  function harvestItem(string memory id, uint _sku, uint _upc, address payable _originFarmerID, string memory _originFarmName, string memory _originFarmInformation, string memory _originFarmLatitude, string memory _originFarmLongitude, string memory _productNotes, string memory _iphfsHash, string memory _itemHash) public 
  {
    require(hasRole(FARMER_ROLE, msg.sender), "Caller is not a farmer");

    

    // Add the new item as part of Harvest
    items[id] = Item({
      sku: _sku, 
      upc: _upc, 
      ownerID: _originFarmerID, 
      originFarmerID: _originFarmerID,
      originFarmName: _originFarmName,
      originFarmInformation: _originFarmInformation,
      originFarmLatitude: _originFarmLatitude,
      originFarmLongitude: _originFarmLongitude,
      productID: _sku + _upc,
      productNotes: _productNotes,
      productPrice: 0,
      itemState: State.Harvested,
      distributorID: address(0),
      retailerID: address(0),
      consumerID: address(0),
      ipfsHash: _iphfsHash,
      itemHash: _itemHash
    });
    // Increment sku
    sku = sku + 1;
    // itemsUPC[sku] = id;
    // Emit the appropriate event
    emit Harvested(id);
  }

  // Define a function 'processtItem' that allows a farmer to mark an item 'Processed'
  function processItem(string memory _upc) verifyCaller(items[_upc].originFarmerID) harvested(_upc) public 
  // Call modifier to check if upc has passed previous supply chain stage
  
  // Call modifier to verify caller of this function
  
  {
    require(hasRole(FARMER_ROLE, msg.sender), "Caller is not a farmer");
    // Setting state
    items[_upc].itemState = State.Processed;
    
    // Emit the appropriate event
    emit Processed(_upc);
  }

  // Define a function 'packItem' that allows a farmer to mark an item 'Packed'
  function packItem(string memory _upc) verifyCaller(items[_upc].originFarmerID) processed(_upc) public 
  // Call modifier to check if upc has passed previous supply chain stage
  
  // Call modifier to verify caller of this function
  
  {
    require(hasRole(FARMER_ROLE, msg.sender), "Caller is not a farmer");
    // Setting state
    items[_upc].itemState = State.Packed;

    // Emit the appropriate event
    emit Packed(_upc);
  }

  // Define a function 'sellItem' that allows a farmer to mark an item 'ForSale'
  function sellItem(string memory _upc, uint _price) verifyCaller(items[_upc].originFarmerID) packed(_upc) public 
  // Call modifier to check if upc has passed previous supply chain stage
  
  // Call modifier to verify caller of this function
  
  {
    require(hasRole(FARMER_ROLE, msg.sender), "Caller is not a farmer");

    // Setting state
    items[_upc].itemState = State.ForSale;

    // Setting the price for the item
    items[_upc].productPrice = _price;

    // Emit the appropriate event
    emit ForSale(_upc);
  }

  // Define a function 'buyItem' that allows the disributor to mark an item 'Sold'
  // Use the above defined modifiers to check if the item is available for sale, if the buyer has paid enough, 
  // and any excess ether sent is refunded back to the buyer
  function buyItem(string memory _upc) forSale(_upc) paidEnough(items[_upc].productPrice) checkValueDistributor(_upc) public payable 
  // Call modifier to check if upc has passed previous supply chain stage
  
  // Call modifer to check if buyer has paid enough
  
  // Call modifer to send any excess ether back to buyer
  
  {
    require(hasRole(DISTRIBUTOR_ROLE, msg.sender), "Caller is not a distributor");
    items[_upc].itemState = State.Sold;
    items[_upc].ownerID = msg.sender;
    items[_upc].distributorID = msg.sender;

    // Transfer money to farmer
    items[_upc].originFarmerID.transfer(items[_upc].productPrice);
    
    // emit the appropriate event
    emit Sold(_upc);
  }

  // Define a function 'shipItem' that allows the distributor to mark an item 'Shipped'
  // Use the above modifers to check if the item is sold
  function shipItem(string memory _upc) sold(_upc) public 
  // Call modifier to check if upc has passed previous supply chain stage
  
  // Call modifier to verify caller of this function
  
  {
    require(hasRole(FARMER_ROLE, msg.sender), "Caller is not a distributor");
    // Update the appropriate fields
    items[_upc].itemState = State.Shipped;
    
    // Emit the appropriate event
    emit Shipped(_upc);
  }

  // Define a function 'receiveItem' that allows the retailer to mark an item 'Received'
  // Use the above modifiers to check if the item is shipped
  function receiveItem(string memory _upc) shipped(_upc) paidEnough(items[_upc].productPrice) checkValueRetailer(_upc) payable public 
  // Call modifier to check if upc has passed previous supply chain stage
  
  // Access Control List enforced by calling Smart Contract / DApp
  {
    require(hasRole(RETAILER_ROLE, msg.sender), "Caller is not a retailer");
    // Update the appropriate fields - ownerID, retailerID, itemState
    items[_upc].itemState = State.Received;
    items[_upc].ownerID = msg.sender;
    items[_upc].retailerID = msg.sender;
    
    // Emit the appropriate event
    emit Received(_upc);
  }

  // Define a function 'purchaseItem' that allows the consumer to mark an item 'Purchased'
  // Use the above modifiers to check if the item is received
  function purchaseItem(string memory _upc) received(_upc) paidEnough(items[_upc].productPrice) checkValueConsumer(_upc) public payable 
  // Call modifier to check if upc has passed previous supply chain stage
  
  // Access Control List enforced by calling Smart Contract / DApp
  {
    require(hasRole(CONSUMER_ROLE, msg.sender), "Caller is not a consumer");

    // Update the appropriate fields - ownerID, consumerID, itemState
    items[_upc].itemState = State.Purchased;
    items[_upc].ownerID = msg.sender;
    items[_upc].consumerID = msg.sender;

    // Emit the appropriate event
    emit Purchased(_upc);
  }

  // Define a function 'fetchItemBufferOne' that fetches the data
  function fetchItemBufferOne(string memory _upc) public view returns 
  (
  uint    itemSKU,
  uint    itemUPC,
  address ownerID,
  address originFarmerID,
  string memory originFarmName,
  string memory originFarmInformation,
  string memory originFarmLatitude,
  string memory originFarmLongitude
  ) 
  {
    // Assign values to the 8 parameters
    itemSKU = items[_upc].sku;
    itemUPC = items[_upc].upc;
    ownerID = items[_upc].ownerID;
    originFarmerID = items[_upc].originFarmerID;
    originFarmName = items[_upc].originFarmName;
    originFarmInformation = items[_upc].originFarmInformation;
    originFarmLatitude = items[_upc].originFarmLatitude;
    originFarmLongitude = items[_upc].originFarmLongitude;
    
  return 
  (
    itemSKU,
    itemUPC,
    ownerID,
    originFarmerID,
    originFarmName,
    originFarmInformation,
    originFarmLatitude,
    originFarmLongitude
  );
  }

  // Define a function 'fetchItemBufferTwo' that fetches the data
  function fetchItemBufferTwo(string memory _upc) public view returns 
  (
  uint    itemSKU,
  uint    itemUPC,
  uint    productID,
  string memory productNotes,
  uint    productPrice,
  uint    itemState,
  address distributorID,
  address retailerID,
  address consumerID,
  string memory ipfsHash,
  string memory itemHash
  ) 
  {
    // Assign values to the 9 parameters
    itemSKU = items[_upc].sku;
    itemUPC = items[_upc].upc;
    productID = items[_upc].productID;
    productNotes = items[_upc].productNotes;
    productPrice = items[_upc].productPrice;
    itemState = uint(items[_upc].itemState);
    distributorID = items[_upc].distributorID;
    retailerID = items[_upc].retailerID;
    consumerID = items[_upc].consumerID;
    ipfsHash = items[_upc].ipfsHash;
    itemHash = items[_upc].itemHash;
    
  return 
  (
  itemSKU,
  itemUPC,
  productID,
  productNotes,
  productPrice,
  itemState,
  distributorID,
  retailerID,
  consumerID,
  ipfsHash,
  itemHash
  );
  }
}
