var Cargo = artifacts.require("./Cargo.sol");

module.exports = function(deployer) {
  deployer.deploy(Cargo,10);
};