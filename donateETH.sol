// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import {PriceConverter} from "./PriceConverter.sol";
error NotOwner();

contract donateETH {
   
   // State Variables 
    address[] public funders;
    mapping (address funder => uint256 amountfunded) public AddressToAmountFunded;
    uint256 public constant minimumUSD = 5e18;
    address public immutable i_owner ;
    using PriceConverter for uint256;
    
   // Contract Owner
    constructor(){
        i_owner = msg.sender;
    }
   modifier OnlyOwner (){
        if (msg.sender != i_owner){revert NotOwner();}
        _;
    }
    
    // Donation Function
    function donate() public payable {
        require(msg.value.getConversionRate() >= minimumUSD, "didnt send enough eth");
        funders.push(msg.sender);
        AddressToAmountFunded[msg.sender] += msg.value;
    }

    // Withdraw Function 
   function withdraw() OnlyOwner public {
    for (uint256 FunderIndex; FunderIndex < funders.length; FunderIndex++) {
        address funder = funders[FunderIndex];
        AddressToAmountFunded[funder] = 0;
    
    }
   (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
   require(callSuccess,"call failed" );

   }
   
    // User error fallbacks 
    receive() external payable { 
        donate();
    }
    fallback() external payable {
        donate();
    }
}
