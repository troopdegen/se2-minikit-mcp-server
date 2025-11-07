import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the {{contractName}} contract
 *
 * @param hre HardhatRuntimeEnvironment object
 */
const deploy{{contractName}}: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const initialGreeting = "Hello from {{projectName}}!";

  await deploy("{{contractName}}", {
    from: deployer,
    args: [initialGreeting],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const contract = await hre.ethers.getContract("{{contractName}}", deployer);

  console.log(`\n{{contractName}} deployed at: ${await contract.getAddress()}`);
  console.log(`Initial greeting: "${await contract.greeting()}"`);
  console.log(`Owner: ${await contract.owner()}`);
};

export default deploy{{contractName}};

// Tags for selective deployment
deploy{{contractName}}.tags = ["{{contractName}}"];
