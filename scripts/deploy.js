const hre = require("hardhat");
const { ethers, run, network } = require("hardhat");

async function main() {
  console.log("Deploying contract...");
  const simpleStorage = await ethers.deployContract("SimpleStorage");
  await simpleStorage.waitForDeployment();

  const contractAddress = await simpleStorage.getAddress();
  console.log("Simple Storage Deployed to: ", contractAddress);

  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    await verify(simpleStorage.target, []);
  }

  const currentFavNum = await simpleStorage.retrieve();
  console.log(`Current favorite num is: ${currentFavNum}`);

  //Update Favorite Number
  const transactionResponse = await simpleStorage.store(200);
  await transactionResponse.wait(1);
  const updateFavNum = await simpleStorage.retrieve();
  console.log(`Updated favorite number is: ${updateFavNum}`);
}

async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified");
    } else {
      console.log(e);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
