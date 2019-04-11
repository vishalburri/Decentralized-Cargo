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
    var loader = $("#loader");  
    var ridedetails = $("#ridedetails");

    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    var cargoInstance = await App.contracts.Cargo.deployed();
    console.log(App.account);
    if(App.account!=null){
      var isValid = await cargoInstance.isDriverValid({from:App.account});
      ridedetails.empty();
      if(!isValid){
          loader.hide();
          App.showlist();
      } 
      else{
          alert('Login from user account');
        }
    }
    else{
      alert('Connect to Metamask');
    }
    // Load account data
  },


  showlist : async function(){
    var ridedetails = $("#ridedetails");
    ridedetails.empty();
    var cargoInstance = await App.contracts.Cargo.deployed();
    var id = await cargoInstance.getCargoList({from:App.account});
    if(id[0]==0)
      ridedetails.append("<center><div class='well well-sm'><h4>Cargo List Empty</h4></div></center>");

    for(var i=0;i<id.length;i++){
        if(id[i]==0)
          break;
        var details = await cargoInstance.getCargoDetails(id[i]-1,{from:App.account});
        
        ridedetails.append("<center><div class='well well-sm'><h4>List Of Cargos</h4></div></center>");
        ridedetails.append("<div class='col-sm-4'><h4>Category</h4></div><div class='col-sm-4'><h4>Cargo name</h4></div>");
        ridedetails.append("<div class='col-sm-2'><h4>Amount to pay</h4></div><br>");

        ridedetails.append("<div class='col-sm-4'>"+details[0]+"</div>");
        ridedetails.append("<div class='col-sm-4'>"+details[1]+"</div>");
        ridedetails.append("<div class='col-sm-2'>"+details[2]+"</div>");
        var b = id[i]-1;      
        ridedetails.append("<div class='col-sm-2'><button type='button' class='btn btn-success' onclick='App.bookRequest("+b+");'>Delivered</button></div>");
        
    }
    ridedetails.show();
  },
  bookRequest : async function(_id){
    var cargoInstance = await App.contracts.Cargo.deployed();
    try{
      cargoInstance.delivered(_id,{from:App.account});
      App.showlist();
    }
    catch(err){
      alert("Cannot Book Request");
      console.log(err);
    }
  },
  

  
};

$(function() {
  $(window).load(function() {
      App.init();
  });
});