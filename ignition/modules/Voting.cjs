const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const VotingModule = buildModule("VotingModule", (m) => {
  const names = [
    "Dr. William Ruto",
    "Mr. Moraa Kebaso",
    "Dr. Fred Matiang'i",
    "Mr. Edwin Sifuna"
  ];
  
  const parties = [
    "UDA",
    "PDP",
    "DCP",
    "LMP"
  ];

  const imageHashes = [
    "bafkreibippdgfcj6a4ueunutgr4c5qyrhvqbnxz7w7ftzq75j6zxc5655i",
    "bafybeigqmeqz5cihyru2yixzv73ek7whb4hp6poe5r6stgaubdv7amg5im",
    "bafkreic4nnjeytqtmlmgxioqrge4cnpjbxjtx2yq3tuberffl52rcomqcu",
    "bafkreihga5dy2pditscdj7hcctb3w4v57eclwcht6j43o3izxzcjqdtsgm"
  ];

  const durationInMinutes = 24 * 60; // 24 hours

  const voting = m.contract("Voting", [names, parties, imageHashes, durationInMinutes]);

  return { voting };
});

module.exports = VotingModule;
