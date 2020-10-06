Ropstein Deployment information

Deploying 'SupplyChain'
-----------------------
* transaction hash:    0xaacaab74123bf9f25c605deb61c68c56ddb85dfa6deea2ca4131920f384aa1e2
* Blocks: 1            Seconds: 24
* contract address:    0x7e39aD44eA38a64688519D1f5DCb8741B6D92EdA
* block number:        8826971
* block timestamp:     1602015754
* account:             0x3De97441dCA106d770469B3537c2721a0100409d
* balance:             1.83300859135018
* gas used:            5477154 (0x539322)
* gas price:           20 gwei
* value sent:          0 ETH
* total cost:          0.10954308 ETH


Libraries used were openzeppelin, js-sha256, and ipfs-http-client

* openzeppelin - Used this in order to remove most of the access control code by utilizing a library that has the proper implementation of these. Basically coffeeaccesscontrol only has one file implementing openzeppelin.
* js-sha256 - hashed the info for the coffee to have a variable that we can check againt in the end.
* ipfs-http-client - used for uploading a file to infura.

Software info:
* Truffle v5.1.46 (core: 5.1.46)
* Solidity - ^0.6.0 (solc-js)
* Node v14.4.0
* Web3.js v1.2.1