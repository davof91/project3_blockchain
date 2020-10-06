App = {
    web3Provider: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    originFarmerID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    productNotes: null,
    productPrice: 0,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",
    fileHash:"",
    itemHash:"",
    hashed:"",
    fileArray: [],

    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.sku_search = $("#sku_search").val();
        App.upc_search = $("#upc_search").val();
        App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.productNotes = $("#productNotes").val();
        App.productPrice = $("#productPrice").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        
        window.ethereum.on('accountsChanged', function (accounts) {
            // Time to reload your interface with accounts[0]!
            console.log(accounts)
            location.reload();
        })
        
        window.ethereum.on('networkChanged', function (networkId) {
            // Time to reload your interface with the new networkId
            console.log(networkId)
            location.reload();
        })

        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];

        })
    },

    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain='../../build/contracts/SupplyChain.json';
        
        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function(data) {
            //console.log('data',data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);

            $("#myFile").on("change", function() {
                var reader = new FileReader();
                reader.onload = function (e) {
                    console.log(App.fileArray)
                    const buffer_file = buffer.Buffer(reader.result);
                    App.fileArray = buffer_file
                    console.log(App.fileArray)
                }
                reader.readAsArrayBuffer(this.files[0]);
                
            })

            App.fetchEvents();

            App.getAllRoles();

            //App.getItemsUPC();

            App.checkRoles();
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));

        switch(processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            case 9:
                return await App.fetchItemBufferOne(event);
                break;
            case 10:
                return await App.fetchItemBufferTwo(event);
                break;
            case 11: // Adding roles
                return await App.addRole(event);
                break;

            case 12: // Adding showing price html
                return await App.showPrice(event);
                break;

            case 13: // Adding showing price html
                return await App.fetchAllItemInfo(event);
                break;
        }   
    },

    showPrice: function(event){
        var upc = parseInt($(event.target).data('upc'));
        console.log(upc)

        const forSaleButton = App.buildButton("4", "btn-for-sale", "Submit", upc, 2);

        // <input type="number" id="productPrice" name="productPrice" value=1>ETH<br>
        var input = document.createElement("input");
        input.setAttribute('name' , "productPrice");
        input.setAttribute('typw' , "number");
        input.id = "productPrice";
        input.value = 0.0005;
        document.getElementById("priceDiv-"+upc).appendChild(input)
        document.getElementById("priceDiv-"+upc).appendChild(forSaleButton)

    },

    checkRoles: async function(){
        App.contracts.SupplyChain.deployed().then( async function(instance) {
            const checkedAdmin = await instance.checkAdmin(App.metamaskAccountID);
            const checkFarmer = await instance.checkFarmer(App.metamaskAccountID);

            console.log("Admin: ",checkedAdmin);
            if(checkedAdmin){
                $("#admin_tab").css("display", "");
            }
            if(checkFarmer){
                $("#create_item_tab").css("display", "");
            }

        }).catch(function(err) {
            // alert("Sorry but the account was not added for that role.")
            console.log(err.message);
        });
    },

    getAllRoles: async function(event){
        App.contracts.SupplyChain.deployed().then( async function(instance) {
            const checkedFarmer = await instance.getUsersRoles(0);
            const checkedDistributor = await instance.getUsersRoles(1);
            const checkedRetailer = await instance.getUsersRoles(2);
            const checkedConsumer = await instance.getUsersRoles(3);

            console.log(checkedFarmer)
            console.log(checkedDistributor)
            console.log(checkedRetailer)
            console.log(checkedConsumer)

            
        }).catch(function(err) {
            // alert("Sorry but the account was not added for that role.")
            console.log(err.message);
        });
    },

    getAllItems: function(all_ids){
        const temp = []
        $.each(all_ids, (index, id) => {
            var item_id = id['c'][0];
            if(!temp.includes(item_id)){
                temp.push(item_id)
                App.fetchAllItemInfo(item_id);
            }
            
        })
    },

    addRole: function(event) {
        event.preventDefault();
        
        App.contracts.SupplyChain.deployed().then(function(instance) {
            var role = $("#selected_role").val();
            var action = $("#action_role").val();
            var user_id = $("#user_id_role").val();
            //console.log(role,action,user_id)

            user_id_role
            if(action=="add"){
                if(role == 0){
                    return instance.addFarmer(user_id);
                }
                else if(role == 1){
                    return instance.addDistributor(user_id);
                }
                else if(role == 2){
                    return instance.addRetailer(user_id);
                }
                else if(role == 3){
                    return instance.addConsumer(user_id);
                }
            }
            else{
                if(role == 0){
                    return instance.removeFarmer(user_id);
                }
                else if(role == 1){
                    return instance.removeDistributor(user_id);
                }
                else if(role == 2){
                    return instance.removeRetailer(user_id);
                }
                else if(role == 3){
                    return instance.removeConsumer(user_id);
                }
            }

            
        }).then(function(result) {
            console.log('Adding role',result);
        }).catch(function(err) {
            alert("Sorry but the account was not added for that role.")
            console.log(err.message);
        });
    },

    harvestItem: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.readForm()

        App.hashed = window.sha256(App.sku +"_"+App.upc)
        
        App.itemHash = window.sha256(App.sku+App.upc+App.originFarmerID+ App.originFarmName+App.originFarmInformation+ App.originFarmLatitude+ App.originFarmLongitude+ App.productNotes)

        var harvested = "";

        App.contracts.SupplyChain.deployed().then(async function(instance) {
            const ipfs = window.IpfsHttpClient('ipfs.infura.io', '5001', { protocol: 'https' });
            console.log(App.fileArray)
            if(App.fileArray.length > 0){
                $("#loader").css("display", "block");
                ipfs.add(App.fileArray, async (err, result) => {
                    console.log(err, result);
    
                    let ipfsLink = "<a href='https://gateway.ipfs.io/ipfs/" + result[0].hash + "'>Click Here to see uploaded image</a>";
                    document.getElementById("link").innerHTML = ipfsLink;
                    App.fileHash = result[0].hash;
    
                    console.log(App.fileArray)
                    harvested = await instance.harvestItem(
                        App.hashed,
                        App.sku,
                        App.upc, 
                        App.metamaskAccountID, 
                        App.originFarmName, 
                        App.originFarmInformation, 
                        App.originFarmLatitude, 
                        App.originFarmLongitude, 
                        App.productNotes,
                        App.fileHash,
                        App.itemHash,
                    );
                    App.fileArray = []
                    $("#loader").css("display", "none");
    
                })
            }
            else{
                harvested = await instance.harvestItem(
                    App.hashed,
                    App.sku,
                    App.upc, 
                    App.metamaskAccountID, 
                    App.originFarmName, 
                    App.originFarmInformation, 
                    App.originFarmLatitude, 
                    App.originFarmLongitude, 
                    App.productNotes,
                    [],
                    App.itemHash,
                );
            }
            
            $("#ftc-item").text(harvested);
            // $("#item_list").empty();
            // App.getItemsUPC();
            
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    processItem: function (event) {
        event.preventDefault();
        // var processId = parseInt($(event.target).data('id'));
        // var upcButton = parseInt($(event.target).data('upc'));
        App.readForm();
        const hashed = sha256(App.sku_search+"_"+App.upc_search)

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.processItem(hashed, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            $("#item_list").empty();
            // App.getItemsUPC();
            App.fetchAllItemInfo("")
            console.log('processItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },
    
    packItem: function (event) {
        event.preventDefault();
        // var processId = parseInt($(event.target).data('id'));
        // var upcButton = parseInt($(event.target).data('upc'));
        const hashed = sha256(App.sku_search+"_"+App.upc_search)

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.packItem(hashed, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            $("#item_list").empty();
            App.fetchAllItemInfo("")
            console.log('packItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    sellItem: function (event) {
        event.preventDefault();
        // var processId = parseInt($(event.target).data('id'));
        // var upcButton = parseInt($(event.target).data('upc'));
        var producPrice = $("#productPrice").val();
        const hashed = sha256(App.sku_search+"_"+App.upc_search)

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const productPrice = web3.toWei(producPrice, "ether");
            console.log('productPrice',productPrice);
            return instance.sellItem(hashed, productPrice, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            $("#item_list").empty();
            App.fetchAllItemInfo("")
            console.log('sellItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    buyItem: function (event) {
        event.preventDefault();
        // var processId = parseInt($(event.target).data('id'));
        // var upcButton = parseInt($(event.target).data('upc'));
        const hashed = sha256(App.sku_search+"_"+App.upc_search)
        
        App.contracts.SupplyChain.deployed().then(async function(instance) {
            const buff = await instance.fetchItemBufferTwo.call(hashed);
            //const walletValue = web3.toEther(buff[4], "wei");
            console.log(buff[4]);
            console.log(web3.fromWei(buff[4], "ether"))
            return instance.buyItem(hashed, {from: App.metamaskAccountID, value: buff[4]});
        }).then(function(result) {
            $("#ftc-item").text(result);
            App.fetchAllItemInfo("")
            console.log('buyItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    shipItem: function (event) {
        event.preventDefault();
        // var processId = parseInt($(event.target).data('id'));
        // var upcButton = parseInt($(event.target).data('upc'));
        const hashed = sha256(App.sku_search+"_"+App.upc_search)

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.shipItem(hashed, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            App.fetchAllItemInfo("")
            console.log('shipItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    receiveItem:  function (event) {
        event.preventDefault();
        // var processId = parseInt($(event.target).data('id'));
        // var upcButton = parseInt($(event.target).data('upc'));
        const hashed = sha256(App.sku_search+"_"+App.upc_search)

        App.contracts.SupplyChain.deployed().then(async function(instance) {
            const buff = await instance.fetchItemBufferTwo.call(hashed);
            const walletValue = web3.toWei(buff[4], "ether");
            return instance.receiveItem(hashed, {from: App.metamaskAccountID,  value: buff[4]});
        }).then(function(result) {
            $("#ftc-item").text(result);
            App.fetchAllItemInfo("")
            console.log('receiveItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    purchaseItem: function (event) {
        event.preventDefault();
        // var processId = parseInt($(event.target).data('id'));
        // var upcButton = parseInt($(event.target).data('upc'));
        const hashed = sha256(App.sku_search+"_"+App.upc_search)

        App.contracts.SupplyChain.deployed().then(async function(instance) {
            const buff = await instance.fetchItemBufferTwo.call(hashed);
            const walletValue = web3.toWei(buff[4], "ether");
            return instance.purchaseItem(hashed, {from: App.metamaskAccountID,  value: buff[4]});
        }).then(function(result) {
            $("#ftc-item").text(result);
            App.fetchAllItemInfo("")
            console.log('purchaseItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    fetchItemBufferOne: function (upc) {
    ///   event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));
        //App.upc = $('#upc').val();
        //console.log('upc',App.upc);

        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItemBufferOne(upc);
        }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('fetchItemBufferOne', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchItemBufferTwo: function (upc) {
    ///    event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));
                        
        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItemBufferTwo.call(upc);
        }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('fetchItemBufferTwo', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    buildButton: function(id, buttonClass, name, upc, state ){
        var button = document.createElement("button");
        button.class=buttonClass;
        button.id = "button";
        button.type = "button";
        button.setAttribute('data-id' , id);
        button.setAttribute('data-upc', upc) ;
        if(id == "12"){
            id = 4;
        }
        if(state != parseInt(id)-2){
            button.disabled = true;
            button.style='opacity:0.5';
        }
        button.append(name);

        return button;
    },

    fetchAllItemInfo: async function(event){
        $("#item_list").empty();
        App.readForm();
        const hashed = sha256(App.sku_search+"_"+App.upc_search)

        const supplyChain = await App.contracts.SupplyChain.deployed();

        const bOne = await supplyChain.fetchItemBufferOne.call(hashed);
        const bTwo = await supplyChain.fetchItemBufferTwo.call(hashed);
        if(bOne[2] == "0x0000000000000000000000000000000000000000"){
            alert("No item with those SKU and UPC");
        }
        else{
            var well = document.createElement("div");
            well.className = "col-md-5"
            well.style = "margin:10px; overflow-x: auto;"
            const cols = ['sku','upc','Owner ID','Origin Farmer ID','Farm Name', 'Farm Info',
            'Farm Latitude','Farm Longitude','Product Notes','Product Price ', 'State' ,'Distributor ID',
            'Retailer ID','Consumer ID', "Image Hash", "Item Hash"];
    
            const processButton = App.buildButton("2", "btn-process", "Process", ""+bOne[1], bTwo[5]);
            const packPutton = App.buildButton("3", "btn-pack", "Pack", ""+bOne[1], bTwo[5]);
            const forSaleButton = App.buildButton("12", "btn-for-sale", "For Sale", ""+bOne[1], bTwo[5]);
            const buyButton = App.buildButton("5", "btn-buy", "Buy", ""+bOne[1], bTwo[5]);
            const shipButton = App.buildButton("6", "btn-ship", "Ship", ""+bOne[1], bTwo[5]);
            const receiveButton = App.buildButton("7", "btn-reveive", "Receive", ""+bOne[1], bTwo[5]);
            const purchaseButton = App.buildButton("8", "btn-purchase", "Purchase", ""+bOne[1], bTwo[5]);
    
            if(await supplyChain.checkFarmer(App.metamaskAccountID)){
                well.appendChild(processButton);
                well.appendChild(packPutton);
                well.appendChild(forSaleButton);
            }
    
            if(await supplyChain.checkDistributor(App.metamaskAccountID)){
                well.appendChild(buyButton);
                
            }
            if(await supplyChain.checkFarmer(App.metamaskAccountID)){
                well.appendChild(shipButton);
            }
    
    
            if(await supplyChain.checkRetailer(App.metamaskAccountID)){
                well.appendChild(receiveButton);
            }
    
            if(await supplyChain.checkConsumer(App.metamaskAccountID)){
                well.appendChild(purchaseButton);
            }
    
            const states = [    "Harvested",  // 0
                "Processed",  // 1
                "Packed",     // 2
                "For Sale",    // 3
                "Sold",       // 4
                "Shipped",    // 5
                "Received",   // 6
                "Purchased"   // 7
            ];
    
            var priceDiv = document.createElement("div");
            priceDiv.id = "priceDiv-"+bOne[1];
    
            var header = document.createElement("h3");
            var node = document.createTextNode(bOne[1]);
            header.appendChild(node);
    
            well.appendChild(priceDiv);
    
            $.each(bOne, (index, value)=>{
                var para = document.createElement("p");
                var node = document.createTextNode(cols[index]+ ": "+ value);
                para.appendChild(node);
                well.appendChild(para)
            })
    
            $.each(bTwo, (index, value)=>{
                if(index >2){
                    var para = document.createElement("p");
                    var nodeBold = document.createTextNode(cols[index+5]+": ");
                    if(cols[index+5] == "State"){
                        var node = document.createTextNode(states[value]);
                    }else{
                        if(index == 4){
                            var node = document.createTextNode(value+" wei");
                        }
                        else{
                            var node = document.createTextNode(value);
                        }
                        
                    }
                    
                    para.appendChild(nodeBold);
                    para.appendChild(node);
                    well.appendChild(para)
                }
            })
    
            var row = document.createElement("div");
            row.className = "container-fluid row"
            var picture = document.createElement("div");
            picture.className = "col-md-5"
    
            if (bTwo[9] != ""){
                var img = document.createElement("img");
                img.setAttribute('src' , 'https://gateway.ipfs.io/ipfs/' + bTwo[9]);
    
                img.setAttribute('width' , screen.width/4);
                img.setAttribute('height' ,screen.height/3);
                picture.appendChild(img)
            }
    
            row.appendChild(well);
            row.appendChild(picture);
    
            $( "#item_list" ).append( header );
            $( "#item_list" ).append( row );
            
    
            if($( "#item_list" ).hasClass("ui-accordion")){
                $( "#item_list" ).accordion('destroy').accordion();
            }
            $( "#item_list" ).accordion();
        }
        
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        }).catch(function(err) {
          console.log(err.message);
        });
        
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});