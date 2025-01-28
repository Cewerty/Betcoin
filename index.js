import { JsonRpcProvider, Wallet, Contract, parseUnits, formatUnits, } from 'ethers';
import BetcoinArtifact from './artifacts/contracts/token.sol/Betcoin.json' with {type: 'json'};

const contractABI = BetcoinArtifact.abi;

const provider = new JsonRpcProvider('http://127.0.0.1:8545/');

const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const signer = new Wallet(privateKey, provider);

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const contract = new Contract(contractAddress, contractABI, signer);


async function main() {
    try {
        const recipientAddress = await signer.getAddress(); 
        const mintAmount = parseUnits('1000000', 18);

        console.log(`Минтим ${formatUnits(mintAmount, 18)} токенов на адрес ${recipientAddress}`);

        // Выполнение транзакции минтинга
        const mintTx = await contract.mint(mintAmount);
        await mintTx.wait();

        console.log('Минтинг выполнен успешно.');

        //Проверка баланса после минтинга
        const balanceAfterMint = await contract.balanceOf(recipientAddress);
        console.log(`Баланс после минтинга: ${formatUnits(balanceAfterMint, 18)} токенов`);

        const burnAmount = parseUnits('500000', 18);

        console.log(`Сжигаем ${formatUnits(burnAmount, 18)} токенов с адреса ${recipientAddress}`);

        // Выполнение транзакции сжигания
        const burnTx = await contract.burn(burnAmount);
        await burnTx.wait();

        console.log('Сжигание выполнено успешно.');

        // Проверка баланса после сжигания
        const balanceAfterBurn = await contract.balanceOf(recipientAddress);
        console.log(`Баланс после сжигания: ${formatUnits(balanceAfterBurn, 18)} токенов`);
    } catch (error) {
        console.error('Ошибка при взаимодействии с контрактом:', error);
    }
}


main();
