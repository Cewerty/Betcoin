import { BrowserProvider, Contract, parseUnits, formatUnits } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js';
import StorageArtifact from "../artifacts/contracts/storage.sol/Storage.json" with { type: 'json' };

// ABI и адрес для подключения к контракту хранилища
const contractABI = StorageArtifact.abi;
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

let provider;
let signer;
let contract;
let user_address;

// Элементы интерфейса
const totalAmount = document.getElementById("storage-totalAmount");
const tokenBalance = document.getElementById("tokenBalance");
const deposited = document.getElementById("storage-deposited");

const depositForm = document.getElementById("storage-deposit");
const depositAmount = document.getElementById("storage-depositAmount");

const withdrawForm = document.getElementById("storage-withdraw");
const withdrawAmount = document.getElementById("storage-withdrawAmount");

async function init() {
    if (window.ethereum) {
        provider = new BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        signer = await provider.getSigner();
        contract = new Contract(contractAddress, contractABI, signer);

        // Получаем данные о хранилище
        const allTokens = await contract.getTokenAmount();
        totalAmount.innerText = formatUnits(allTokens, 18);

        // Получаем данные о пользователе
        user_address = await signer.getAddress();
        const Balance = await contract.getUserTokenBalance(user_address);
        tokenBalance.innerText = formatUnits(Balance, 18);
        const wasDeposited = await contract.getUserBalance(user_address);
        deposited.innerText = formatUnits(wasDeposited, 18);
    } else {
        alert("Install Metamask!");
    }
}

window.onload = init();

depositForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const Amount = depositAmount.value.trim();
        const BNAmount = parseUnits(Amount, 18);

        // Проверяем баланс пользователя
        const userBalance = await contract.getUserTokenBalance(user_address);
        if (userBalance < BNAmount) {
            alert("Недостаточно средств для депозита");
            return;
        }

        // Получаем адрес токена из контракта хранилища
        const tokenAddress = await contract.tokenAddress();
        const tokenContract = new Contract(tokenAddress, ["function approve(address spender, uint256 amount)"], signer);

        // Вызываем approve для разрешения перевода токенов
        const approveTx = await tokenContract.approve(contractAddress, BNAmount);
        const approveReceipt = await approveTx.wait();

        if (approveReceipt.status === 0) {
            alert("Не удалось получить доступ для перевода средств на депозит");
            return;
        }

        // Вызываем deposit для перевода токенов на депозит
        const depositTx = await contract.deposit(BNAmount);
        const depositReceipt = await depositTx.wait();

        if (depositReceipt.status === 0) {
            alert("Ошибка при переводе средств на депозит.");
        } else {
            alert("Токены успешно положены на депозит.");
        }

        // Обновляем данные на интерфейсе
        const balance = await contract.getUserBalance(user_address);
        const newTokenBalance = await contract.getUserTokenBalance(user_address);
        const totalTokenAmount = await contract.getTokenAmount();

        totalAmount.innerText = formatUnits(totalTokenAmount, 18);
        tokenBalance.innerText = formatUnits(newTokenBalance, 18);
        deposited.innerText = formatUnits(balance, 18);
    } catch (error) {
        console.error("Deposit error:", error);
        alert("Произошла ошибка при выполнении депозита.");
    }
});

withdrawForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const Amount = withdrawAmount.value.trim();
        const BNAmount = parseUnits(Amount, 18);

        // Проверяем баланс пользователя в хранилище
        const userDepositBalance = await contract.getUserBalance(user_address);
        if (userDepositBalance < BNAmount) {
            alert("Недостаточно средств для вывода");
            return;
        }

        // Вызываем withdraw для вывода токенов
        const withdrawTx = await contract.withdrawTokens(BNAmount);
        const withdrawReceipt = await withdrawTx.wait();

        if (withdrawReceipt.status === 0) {
            alert("Ошибка при выводе средств.");
        } else {
            alert("Токены успешно выведены.");
        }

        // Обновляем данные на интерфейсе
        const balance = await contract.getUserBalance(user_address);
        const newTokenBalance = await contract.getUserTokenBalance(user_address);
        const totalTokenAmount = await contract.getTokenAmount();

        totalAmount.innerText = formatUnits(totalTokenAmount, 18);
        tokenBalance.innerText = formatUnits(newTokenBalance, 18);
        deposited.innerText = formatUnits(balance, 18);
    } catch (error) {
        console.error("Withdraw error:", error);
        alert("Произошла ошибка при выводе средств.");
    }
});