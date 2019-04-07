App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Cargo.json", function(cargo) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Cargo = TruffleContract(cargo);
      // Connect provider to interact with contract
      App.contracts.Cargo.setProvider(App.web3Provider);

      // App.listenForEvents();

      return App.render();
    });
  },
  render: async function() {
    var cargoInstance;
    var loader = $("#loader");  
    var content = $("#regdriver");
    var registered = $("#registered");
    
    // loader.hide();
    // content.show();
    loader.show();
    
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddr").html("Your Account: " + account);
      }
    });
    var cargoInstance = await App.contracts.Cargo.deployed(); 
    if(App.account!=null){
        var isValid = await cargoInstance.isDriverValid({from:App.account});
        if(!isValid){
          loader.hide();
          content.show();
        }
        else{
          loader.hide();
          content.hide();
          registered.show();
        }
    }
    else{
       alert('Connect to Metamask');
    }
    
    // Load account data
  },

  regDriver : async function(){
    
    var loader = $("#loader");  
    var content = $("#regdriver");
    var registered = $("#registered");
    var cname = $("#companyname").val();
    var name = $("#drivername").val();
    var phno = $("#phno").val();
    var email = $("#email").val();
    var cargoInstance = await App.contracts.Cargo.deployed();

    try{
      var fee = await cargoInstance.regFee.call();
      await cargoInstance.registerCarrier(cname,name,phno,email,{from:App.account,value:fee});
      content.hide();
      registered.show();
    }
    catch(err){
      alert("Insufficient Fee");  
     }
  },

   addService : async function(){
    var content = $("#regdriver");
    var registered = $("#registered");
    var lat = $("#lat").val();
    var long = $("#lon").val();
    var fare = $("#fare").val();
    var e = document.getElementById("path");
	var strUser = e.options[e.selectedIndex].text;
	console.log(strUser);
    var cargoInstance = await App.contracts.Cargo.deployed();

    try{
      await cargoInstance.addService(lat,long,fare,strUser,{from:App.account});
      alert('Successfully added service');
      content.hide();
      registered.show();
    }
    catch(err){
      alert("Insufficient Fee");  
     }
  },
  
  
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
