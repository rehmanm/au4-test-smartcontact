import {  loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Faucet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const amount = ethers.utils.parseUnits("1", "ether");
    const [owner, otherAccount] = await ethers.getSigners();

    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy({ value: amount } );
    await faucet.deployed();
    const provider = ethers.provider;
    return { faucet, owner, otherAccount, provider, amount };
  }

  describe("Deployment", function () {
    it('should deploy and set the owner correctly', async function () {
      const { faucet, owner } = await loadFixture(deployContract);
  
      expect(await faucet.owner()).to.equal(owner.address);
    });
  });

  describe("Withdrawal", function () {
    [1].forEach((data)=>{
      it(`shouldn't allow withdraw more than 0.1 eth - ${data}`, async function () {
        const { faucet } = await loadFixture(deployContract);
        const amount = ethers.utils.parseEther(data.toString());    
        expect(faucet.withdraw(amount)).to.be.revertedWith(
          "amount should be less or equal to 0.1 eth"
        );
      });
    });

    [0.09, 0.1].forEach((data)=>{
      it(`should allow withdraw less than 0.1 eth - ${data}`, async function () {
        const { faucet, provider } = await loadFixture(deployContract);
        const amount = ethers.utils.parseEther(data.toString()); 

        const faucetBalance =  await provider.getBalance(faucet.address) 

        const tx = await faucet.withdraw(amount);
        tx.wait();
        const faucetBalanceAfter =  await provider.getBalance(faucet.address);
        expect(faucetBalanceAfter.toBigInt()).to.eq(faucetBalance.toBigInt() - amount.toBigInt())
      });
    });
  });

  describe("destroyFaucet", function () {

      it(`shouldnt be called by NOT owner`, async function () {
        const { faucet,  otherAccount } = await loadFixture(deployContract);

        expect(faucet.connect(otherAccount).destroyFaucet()).to.be.revertedWith("required by owner");
 
      });

      it(`shouldn be called by owner only`, async function () {
        const { faucet,  provider } = await loadFixture(deployContract);
        await faucet.destroyFaucet();
        expect(await provider.getCode(faucet.address)).to.hexEqual("0x");
 
      });
    }); 

    
  describe("withdrawAll", function () {

    it(`shouldnt be called by NOT owner`, async function () {
      const { faucet,  otherAccount, } = await loadFixture(deployContract);

      expect(faucet.connect(otherAccount).withdrawAll()).to.be.revertedWith("required by owner");

    });

    it(`shouldn be called by owner only`, async function () {
      const { faucet,  owner, amount, provider } = await loadFixture(deployContract);
      await expect(() => faucet.withdrawAll()).to.changeEtherBalance(owner, amount);
      const faucetBalanceAfter =  await provider.getBalance(faucet.address);
      expect(faucetBalanceAfter).to.eq(0); 
    });
  }); 
});
