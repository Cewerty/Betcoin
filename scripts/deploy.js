// const hre = require('hardhat');
import hre from 'hardhat';


async function main() {

    const [deployer] = await hre.ethers.getSigners();

    console.log("Развертывание контракта от имени аккаунта:", await deployer.getAddress());

    const TokenFactory = await hre.ethers.getContractFactory("Betcoin", deployer);

    // const initialSupply = hre.ethers.parseUnits('1000000', 18);
    const initialSupply = 1;

    const token = await TokenFactory.deploy(initialSupply);

    await token.waitForDeployment();

    const contractAddress = await token.getAddress();

    console.log("Контракт Betcoin развернут по адресу:", contractAddress);

}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error('Ошибка в процессе развертывания:', error);
    process.exit(1);
});

