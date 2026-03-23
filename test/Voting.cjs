const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Voting", function () {
  async function deployVotingFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const names = ["Alice", "Bob"];
    const parties = ["Party A", "Party B"];
    const imageHashes = ["hash1", "hash2"];
    const durationInMinutes = 60; // 1 hour

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(names, parties, imageHashes, durationInMinutes);

    return { voting, owner, otherAccount, names, durationInMinutes };
  }

  describe("Deployment", function () {
    it("Should correctly initialize candidates", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      const candidates = await voting.getCandidates();
      
      expect(candidates.length).to.equal(2);
      expect(candidates[0].name).to.equal("Alice");
      expect(candidates[1].name).to.equal("Bob");
    });
  });

  describe("Voting Process", function () {
    it("Should allow a user to vote and increment vote count", async function () {
      const { voting, otherAccount } = await loadFixture(deployVotingFixture);
      
      await expect(voting.connect(otherAccount).vote(0))
        .to.emit(voting, "VoteCast")
        .withArgs(otherAccount.address, 0);

      const hasVoted = await voting.hasVoted(otherAccount.address);
      expect(hasVoted).to.be.true;

      const candidates = await voting.getCandidates();
      expect(candidates[0].voteCount).to.equal(1);
    });

    it("Should revert if user tries to vote twice", async function () {
      const { voting, otherAccount } = await loadFixture(deployVotingFixture);
      
      await voting.connect(otherAccount).vote(0);
      
      await expect(voting.connect(otherAccount).vote(1)).to.be.revertedWith(
        "You have already voted."
      );
    });

    it("Should revert if voting has ended", async function () {
      const { voting, otherAccount, durationInMinutes } = await loadFixture(deployVotingFixture);
      
      // Fast forward time past the duration
      await time.increase(durationInMinutes * 60 + 1);
      
      await expect(voting.connect(otherAccount).vote(0)).to.be.revertedWith(
        "Election is not active."
      );
    });
  });
});
