import { expect } from "chai";
import { ethers } from "hardhat";
import { {{contractName}} } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("{{contractName}}", function () {
  let contract: {{contractName}};
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  const INITIAL_GREETING = "Hello, Scaffold-ETH 2!";

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const ContractFactory = await ethers.getContractFactory("{{contractName}}");
    contract = await ContractFactory.deploy(INITIAL_GREETING);
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the initial greeting", async function () {
      expect(await contract.greeting()).to.equal(INITIAL_GREETING);
    });

    it("Should set the deployer as owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should emit GreetingChanged event on deployment", async function () {
      const ContractFactory = await ethers.getContractFactory("{{contractName}}");
      await expect(ContractFactory.deploy(INITIAL_GREETING))
        .to.emit(ContractFactory, "GreetingChanged")
        .withArgs(owner.address, INITIAL_GREETING, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });

    it("Should revert if deployed with empty greeting", async function () {
      const ContractFactory = await ethers.getContractFactory("{{contractName}}");
      await expect(ContractFactory.deploy("")).to.be.revertedWithCustomError(
        ContractFactory,
        "EmptyGreeting"
      );
    });
  });

  describe("setGreeting", function () {
    it("Should allow owner to update greeting", async function () {
      const newGreeting = "New greeting!";
      await contract.setGreeting(newGreeting);
      expect(await contract.greeting()).to.equal(newGreeting);
    });

    it("Should emit GreetingChanged event when updated", async function () {
      const newGreeting = "New greeting!";
      await expect(contract.setGreeting(newGreeting))
        .to.emit(contract, "GreetingChanged")
        .withArgs(owner.address, newGreeting, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });

    it("Should revert if non-owner tries to update", async function () {
      await expect(
        contract.connect(user).setGreeting("Unauthorized update")
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });

    it("Should revert if greeting is empty", async function () {
      await expect(
        contract.setGreeting("")
      ).to.be.revertedWithCustomError(contract, "EmptyGreeting");
    });
  });

  describe("getGreeting", function () {
    it("Should return the current greeting", async function () {
      expect(await contract.getGreeting()).to.equal(INITIAL_GREETING);
    });

    it("Should return updated greeting", async function () {
      const newGreeting = "Updated!";
      await contract.setGreeting(newGreeting);
      expect(await contract.getGreeting()).to.equal(newGreeting);
    });
  });

  describe("isOwner", function () {
    it("Should return true for owner address", async function () {
      expect(await contract.isOwner(owner.address)).to.be.true;
    });

    it("Should return false for non-owner address", async function () {
      expect(await contract.isOwner(user.address)).to.be.false;
    });
  });
});
