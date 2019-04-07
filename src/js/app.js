App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  fcost:0,
  caddr : '0x0',
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
    var content = $("#searchride");
    var ridedetails = $("#ridedetails");
    var bookcargo = $("#bookcargo");

    bookcargo.hide();
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
          content.show();
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


  searchDriver : async function(){
    var ridedetails = $("#ridedetails");
    var content = $("#searchride");
    var loader = $("#loader");  
    var curlat = $("#fromlat").val();
    var curlon = $("#fromlon").val();
    var tolat = $("#tolat").val();
    var tolon = $("#tolon").val();
    var volume = $("#volume").val();
    var weight = $("#weight").val();
    var bookcargo = $("#bookcargo");
    bookcargo.hide();
    var e = document.getElementById("path");
  var strUser = e.options[e.selectedIndex].text;

    var cargoInstance = await App.contracts.Cargo.deployed();
    loader.hide();
    loader.empty();
    loader.append("<center><h2>Searching For Nearby Carriers...</h2></center>");
    loader.append("<center><div class='loading'></div></center>");

    content.hide();
    loader.show();
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(3000);
    var id = await cargoInstance.searchCarriers(strUser,curlat,curlon,volume,weight,{from:App.account});
    if(id[0]==0){
      loader.empty();
      loader.append("<center><h2>Sorry No Carriers available now.Please try gain later</h2></center>");
    }
    else{
      loader.empty();
      loader.hide();

      for(var i=0;i<id.length;i++){
        if(id[i]==0)
          break;
        var details = await cargoInstance.getDriverDetails(id[i],{from:App.account});
        App.caddr = details[1];
        var getfare = await cargoInstance.getFare(id[i],strUser,{from:App.account});
        var cost = Math.abs(curlat-tolat)+Math.abs(curlon-tolon);
        ridedetails.append("<center><div class='well well-sm'><h4>List Of Available Drivers</h4></div></center>");
        ridedetails.append("<div class='col-sm-4'><h4>Company-Id</h4></div><div class='col-sm-4'><h4>Company</h4></div>");
        ridedetails.append("<div class='col-sm-2'><h4>FareperKm</h4></div><br>");

        ridedetails.append("<div class='col-sm-4'>"+id[i]+"</div>");
        ridedetails.append("<div class='col-sm-4'>"+details[0]+"</div>");
        ridedetails.append("<div class='col-sm-2'>"+getfare+"</div>");
        ridedetails.append("<div class='col-sm-2'><button type='button' class='btn btn-success' onclick='App.bookRequest("+getfare*cost+");'>Book Now</button></div>");
        
      }
    }
    ridedetails.show();
  },
  bookRequest : async function(cost){
    var ridedetails = $("#ridedetails");
    var bookcargo = $("#bookcargo");
    var cargoInstance = await App.contracts.Cargo.deployed();
    ridedetails.hide();
    bookcargo.show();
    try{
    App.fcost = cost;
    console.log(App.caddr);  
    console.log(cost);  
    }
    catch(err){
      alert("Cannot Book Request");
      console.log(err);
    }
  },
  bookCargo : async function(){
    var ridedetails = $("#ridedetails");
    var content = $("#searchride");
    var bookcargo = $("#bookcargo");
    var category = $("#category").val();
    var cargoname = $("#cargoname").val();
    var cname = $("#cname").val();
    var cphno = $("#cphno").val();
    var cvolume = $("#cvolume").val();
    var cweight = $("#cweight").val();
    var cargoInstance = await App.contracts.Cargo.deployed();
    ridedetails.hide();
    try{
      console.log(App.fcost);
      await cargoInstance.bookCargo(cweight,cvolume,category,cargoname,cphno,cname,App.caddr,{from:App.account,value:App.fcost});
    }
    catch(err){
      alert("Cannot Book Request");
      console.log(err);
    }
    bookcargo.hide();
    content.show();
  },

  
};

$(function() {
  $(window).load(function() {
      App.init();
  });
});