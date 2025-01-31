import { BrowserProvider, Contract, parseUnits, formatUnits, isAddress } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js';
import BetcoinArtifact from "../artifacts/contracts/token.sol/Betcoin.json" with {type: 'json'};

//ABI и адрес для подключения к контракту 
const contractABI = BetcoinArtifact.abi;
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

//Основные данные о токене и баланс пользователя
const tokenSymbol = document.getElementById('token-symbol');
const tokenName = document.getElementById("token-name");
const tokenBalance = document.getElementById("token-userBalance");
const tokenTotalSupply = document.getElementById("token-totalSupply");

//Элементы формы для транзакции
const transactionSum = document.getElementById('transaction-sum');
const transactionAccount = document.getElementById("transaction-account");
const transactionForm = document.getElementById("transaction-form");

//Элементы формы для разрешения пользования
const approveForm = document.getElementById("approve-form");
const approveSum = document.getElementById("approve-sum");
const approveSpender = document.getElementById("approve-spender");

//Элементы формы для транзакции с другого аккаунта
const transactionFromForm = document.getElementById('transfer-from-form');
const transactionFromSum = document.getElementById('transfer-from-sum');
const transactionFromSender = document.getElementById('transfer-from-sender');
const transactionFromReceiver = document.getElementById('transfer-from-receiver');


let provider;
let signer;
let contract;
let user_address;

async function init() {
    if (window.ethereum) {
        provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        contract = new Contract(contractAddress, contractABI, signer);
        tokenSymbol.innerText = await contract.symbol();
        const decimals = await contract.decimals();
        const unformated_total_supply = await contract.totalSupply();
        tokenTotalSupply.innerText = formatUnits(unformated_total_supply, decimals);
        tokenName.innerText = await contract.name();
        user_address = await signer.getAddress();
        const unformated_balance = await contract.balanceOf(user_address);
        tokenBalance.innerText = formatUnits(unformated_balance, decimals);
    }
    else {
        alert("Install Metamask!")
    }
}

window.onload = init();

transactionForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
    const Address = transactionAccount.value.trim();
    const decimals = await contract.decimals();
    const Sum = transactionSum.value.trim();
    const BNSum = parseUnits(Sum, decimals);
    const userBalance = await contract.balanceOf(user_address);
        if (userBalance < Sum) {
            alert("Недостаточно токенов для перевода!");
            return;
    }
    const tx = await contract.transfer(Address, BNSum);
    const receipt = await tx.wait();
    console.log(receipt);
    const balance = await contract.balanceOf(user_address);
    tokenBalance.innerText = formatUnits(balance, decimals);
    if (receipt.status == 0) {
        alert("При проведении транзакции произошла ошибка!");
    }
    else{
        alert("Перевод успешно выполнен!");
    }
    } catch (error) {
        console.log("Transaction error:", error);    
    }
})

approveForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const Sum = approveSum.value.trim();
        const Spender = approveSpender.value.trim();
        if (!isAddress(Spender)) {
            alert("Введеный адрес невалиден");
            return;
        }
        if (Number(Sum) === 0) {
            alert("Сумма должна быть больше нуля");
            return;
        }
        const decimals = await contract.decimals();
        const BNSum = await parseUnits(Sum, decimals);
        const tx = await contract.approve(Spender, BNSum);
        const receipt = tx.wait();
        if (receipt.status === 0) {
            alert("Ошибка при передачи владения токенами.");
        }
        else {
            alert("Передача владением выполнена успешно!");
        }
    } catch (error) {
        console.log("Approval error:", error);
    }
});

transactionFromForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const Sum = transactionFromSum.value.trim();
        const Sender = transactionFromSender.value.trim();
        const senderBalance = await contract.balanceOf(Sender);
        console.log(senderBalance);
        console.log(Sum);
        if (senderBalance < Sum) {
            alert("Недостаточно токенов для перевода");
            return;
        }
        if (Number(Sum) === 0) {
            alert("Сумма должна быть больше нуля");
        }
        const Receiver = transactionFromReceiver.value.trim();
        if (!isAddress(Sender) || !isAddress(Receiver)) {
            alert("Введеные адреса невалидны");
        }
        const decimals = await contract.decimals();
        const BNSum = parseUnits(Sum, decimals);
        const tx = await contract.transferFrom(Sender, Receiver, BNSum);
        const receipt = await tx.wait();
        const balance = await contract.balanceOf(user_address);
        tokenBalance.innerText = formatUnits(balance, decimals);
        if (receipt.status === 0) {
            alert("Ошибка при переводе средств с другого аккаунта");
        }
        else {
            alert("Перевод выполнен успешно!");
        }
    } catch (error) {
        console.log("Transfer from error: ", error);
    }

});