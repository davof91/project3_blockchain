// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')
const sha256 = require('js-sha256'); // npm install js-sha256

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei("1", "ether")
    const ipfsHash = "516d646d64787841543939634a6b66526b785a785a3771384734744e7a683935584b736273447856424a3654696e";
    const itemHash = "";
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    // Testing owner change
    it("Testing Ownable library from openzepilin", async () => {
        const supplyChain = await SupplyChain.deployed();

        const ownerBefore = await supplyChain.owner();
        await supplyChain.transferOwnership(accounts[1]);
        const ownerAfter = await supplyChain.owner();
        //await supplyChain.transferOwnership(accounts[0]);

        assert.equal(ownerBefore, accounts[0], 'Error: User not owner before')
        assert.equal(ownerAfter, accounts[1], 'Error: User not not owner after')

    })

    // Adding Account Role Test
    it("Testing assigning roles with openzepellin to the 5 types of accounts in the contract", async() =>{
        const supplyChain = await SupplyChain.deployed();

        await supplyChain.addFarmer(accounts[1]);
        await supplyChain.addDistributor(accounts[2]);
        await supplyChain.addRetailer(accounts[3]);
        await supplyChain.addConsumer(accounts[4]);

        const checkedAdmin = await supplyChain.checkAdmin(accounts[0]);
        const checkedFarmer = await supplyChain.checkFarmer(accounts[1]);
        const checkedDistributor = await supplyChain.checkDistributor(accounts[2]);
        const checkedRetailer = await supplyChain.checkRetailer(accounts[3]);
        const checkedConsumer = await supplyChain.checkConsumer(accounts[4]);


        assert.equal(sku, 1, 'Error: User not in Admin Role')
        assert.equal(checkedAdmin, true, 'Error: User not in Admin Role')
        assert.equal(checkedFarmer, true, 'Error: User not in Farmer Role')
        assert.equal(checkedDistributor, true, 'Error: User not in Distributor Role')
        assert.equal(checkedRetailer, true, 'Error: User not in Distributor Role')
        assert.equal(checkedConsumer, true, 'Error: User not in Consumer Role')
    })

    // Adding Account Role Test
    it("Testing getting all users for a role", async() =>{
        const supplyChain = await SupplyChain.deployed()

        const checkedFarmer = await supplyChain.getUsersRoles(0);
        const checkedDistributor = await supplyChain.getUsersRoles(1);
        const checkedRetailer = await supplyChain.getUsersRoles(2);
        const checkedConsumer = await supplyChain.getUsersRoles(3);

        assert.equal(checkedFarmer[0], accounts[1], 'Error: User not in Farmer Role')
        assert.equal(checkedDistributor[0], accounts[2], 'Error: User not in Distributor Role')
        assert.equal(checkedRetailer[0], accounts[3], 'Error: User not in Distributor Role')
        assert.equal(checkedConsumer[0], accounts[4], 'Error: User not in Consumer Role')
    })

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Watch the emitted event Harvested()
        var event = await supplyChain.Harvested()

        const hashed = sha256(sku+"_"+upc)
        const full_hash = sha256(sku+upc+originFarmerID+ originFarmName+originFarmInformation+ originFarmLatitude+ originFarmLongitude+ productNotes)


        // Mark an item as Harvested by calling function harvestItem()
        await supplyChain.harvestItem(hashed, sku, upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, ipfsHash, full_hash, {from:accounts[1]})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(hashed)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(hashed)

        
        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[9], '516d646d64787841543939634a6b66526b785a785a3771384734744e7a683935584b736273447856424a3654696e', 'Error: Invalid item ipfshash')
        assert.equal(resultBufferTwo[10], full_hash, 'Error: Invalid item item hash')

        
    })    

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
    
        // Watch the emitted event Processed()
        var event = await supplyChain.Processed();

        const hashed = sha256(sku+"_"+upc)
        // Mark an item as Processed by calling function processtItem()
        await supplyChain.processItem(hashed, {from: accounts[1]});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(hashed)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(hashed)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State')
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        var event = await supplyChain.Packed();      
        
        const hashed = sha256(sku+"_"+upc)

        /// Mark an item as Processed by calling function processtItem()
        await supplyChain.packItem(hashed, {from: accounts[1]});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(hashed)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(hashed)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State')
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        var event = await supplyChain.Packed();        

        const hashed = sha256(sku+"_"+upc)

        /// Mark an item as Processed by calling function processtItem()
        await supplyChain.sellItem(hashed, productPrice, {from: accounts[1]});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(hashed)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(hashed)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item price')
        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State')
          
    })    

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Watch the emitted event Sold()
        var event = supplyChain.Sold()

        const hashed = sha256(sku+"_"+upc)
        
        // Mark an item as Sold by calling function buyItem()
        await supplyChain.buyItem(hashed, {from:accounts[2],value:productPrice})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(hashed)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(hashed)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], accounts[2], 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item price')
        assert.equal(resultBufferTwo[6], accounts[2], 'Error: Invalid distributor id')
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State')
    })    

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Watch the emitted event Sold()
        var event = supplyChain.Shipped()

        const hashed = sha256(sku+"_"+upc)
        
        // Mark an item as Sold by calling function buyItem()
        await supplyChain.shipItem(hashed, {from:accounts[1]})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(hashed)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(hashed)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], accounts[2], 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item price')
        assert.equal(resultBufferTwo[6], accounts[2], 'Error: Invalid distributor id')
        assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State')
              
    })    

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Watch the emitted event Sold()
        var event = supplyChain.Received()

        const hashed = sha256(sku+"_"+upc)
        
        // Mark an item as Sold by calling function buyItem()
        await supplyChain.receiveItem(hashed, {from:accounts[3],value:productPrice})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(hashed)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(hashed)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], accounts[3], 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item price')
        assert.equal(resultBufferTwo[6], accounts[2], 'Error: Invalid distributor id')
        assert.equal(resultBufferTwo[7], accounts[3], 'Error: Invalid retailer id')
        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State')
             
    })    

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Watch the emitted event Sold()
        var event = supplyChain.Purchased()

        const hashed = sha256(sku+"_"+upc)
        
        // Mark an item as Sold by calling function buyItem()
        await supplyChain.purchaseItem(hashed, {from:accounts[4], value:productPrice})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(hashed)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(hashed)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], accounts[4], 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item price')
        assert.equal(resultBufferTwo[6], accounts[2], 'Error: Invalid distributor id')
        assert.equal(resultBufferTwo[7], accounts[3], 'Error: Invalid retailer id')
        assert.equal(resultBufferTwo[8], accounts[4], 'Error: Invalid consumer id')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')
        
    })    

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        const hashed = sha256(sku+"_"+upc)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(hashed)
        
        // Verify the result set:
        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], accounts[4], 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        const hashed = sha256(sku+"_"+upc)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(hashed)
        
        // Verify the result set:
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[2], sku+upc, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Missing or Invalid product note')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item price')
        assert.equal(resultBufferTwo[6], accounts[2], 'Error: Invalid distributor id')
        assert.equal(resultBufferTwo[7], accounts[3], 'Error: Invalid retailer id')
        assert.equal(resultBufferTwo[8], accounts[4], 'Error: Invalid consumer id')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')
    })

});

