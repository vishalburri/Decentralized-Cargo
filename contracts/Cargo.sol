pragma solidity ^0.4.24;

contract Cargo {

  address public owner;
  
  struct Carrier {
    string company;
    string name;
    string email;
    address companyAddr;
    uint phoneNo;
    uint numservice;
    bool valid;
  }

  struct carrierInfo{
    int latitude;
    int longitude;
    uint fareperkm;
    string path;
    uint volume;
    uint weight;
  }

  struct Cargos{
    uint phno;
    string custname;
    string cargoname;
    string category;
    uint weight;
    uint volume;
    address companyAddr;
    uint amountToPay;
  }
  
  mapping(uint => Carrier)  carrierList;
  mapping (address => uint) mapCarrier;
  mapping (address => carrierInfo[]) serviceList;
  mapping (address => Cargos[]) cargoList;
  mapping (address => uint) numCargo;
  
  

  uint public numCarriers;
  uint public regFee;
  uint public maxweight ;
  uint public maxvolume ;

  modifier restricted() {
    if (msg.sender == owner) _;
  }
  // owner deploy this contract with company reg fee
  constructor(uint _regFee) public {
    owner = msg.sender;
    regFee = _regFee;
    maxvolume = 1000;
    maxweight = 1000;
  }

  function registerCarrier(string memory _company,string memory _name,uint _phoneno,string memory _email) public payable {
     require (msg.value >= regFee,"Insufficient Registration Fee");
     require (!carrierList[mapCarrier[msg.sender]].valid,"Not a valid address");
      numCarriers = numCarriers + 1;
      mapCarrier[msg.sender] = numCarriers;
      carrierList[numCarriers] = Carrier({
        company : _company,
        name: _name,
        email:_email,
        phoneNo : _phoneno,
        numservice :0,
        companyAddr: msg.sender,
        valid  : true
      });
  }

  function addService (int _latitude,int _longitude,uint _fare,string _path) public {

    require (carrierList[mapCarrier[msg.sender]].valid,"Not a valid address");
    
    carrierInfo memory currentservice;
    carrierList[mapCarrier[msg.sender]].numservice += 1;
    currentservice.latitude = _latitude;
    currentservice.longitude = _longitude;
    currentservice.fareperkm = _fare;
    currentservice.path = _path;
    currentservice.volume = 0;
    currentservice.weight = 0;
    serviceList[msg.sender].push(currentservice);
  }

  function getService (uint _id) public view returns(string res,uint fare,int lat,int lon) {

    return (serviceList[msg.sender][_id].path,serviceList[msg.sender][_id].fareperkm,serviceList[msg.sender][_id].latitude,serviceList[msg.sender][_id].longitude);
  }

  function searchCarriers (string  _path,int _latitude,int _longitude,uint _volume,uint _weight) public view returns(uint[]) {
    require (!carrierList[mapCarrier[msg.sender]].valid,"Not a valid address");
     
     uint[] memory requestList = new uint[](5);
     uint count = 0;
     for(uint i=1;i<=numCarriers;i++){
        address compaddr = carrierList[i].companyAddr;
       
        uint numser = carrierList[i].numservice;
        for(uint j=0;j<numser;j++){
          int disLat = (_latitude - serviceList[compaddr][j].latitude) * (_latitude - serviceList[compaddr][j].latitude);
          int disLon = (_longitude - serviceList[compaddr][j].longitude) * (_longitude - serviceList[compaddr][j].longitude);
          string memory b = serviceList[compaddr][j].path;
          if(disLat + disLon < 100 &&  keccak256(abi.encodePacked(_path)) == keccak256(abi.encodePacked(b)) && maxweight >= serviceList[compaddr][j].weight+_weight && maxvolume >= serviceList[compaddr][j].volume+_volume)
            {
              if(count==5)
                break;
              requestList[count] = i;
            }
        }
        count++;
      } 

      return requestList;
  }

  function bookCargo(uint _weight,uint _volume,string _category,string _name,uint _phno,string _custname,address _caddr) public payable {
      require (!carrierList[mapCarrier[msg.sender]].valid,"Not a valid address");
      
      Cargos memory currentcargo;
      numCargo[msg.sender]+=1;
      currentcargo.weight = _weight;
      currentcargo.volume = _volume;
      currentcargo.category = _category;
      currentcargo.custname = _custname;
      currentcargo.phno = _phno;
      currentcargo.cargoname = _name;
      currentcargo.companyAddr = _caddr;
      currentcargo.amountToPay = 0;
      cargoList[msg.sender].push(currentcargo);
   }

   function isDriverValid() public view returns(bool res) {
    if(mapCarrier[msg.sender]>0)
      return true;
    else
      return false;  
  }
   function getDriverDetails (uint id) public view returns(string,address)  {
    require (id >0 && id <=numCarriers,"Invalid id of driver");

    return (carrierList[id].company,carrierList[id].companyAddr);
  }
  function getFare (uint id,string _path) public view returns(uint)  {
    require (id >0 && id <=numCarriers,"Invalid id of driver");
    uint fare;
    uint numser = carrierList[id].numservice;
    address compaddr = carrierList[id].companyAddr;
    string memory b = serviceList[compaddr][j].path;
    
    for(uint j=0;j<numser;j++){
      if(keccak256(abi.encodePacked(_path)) == keccak256(abi.encodePacked(b)))
        fare = serviceList[compaddr][j].fareperkm;
    }

    return fare;
  }

  


}
