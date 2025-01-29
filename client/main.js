import { BrowserProvider, Contract } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js';
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
        console.log(await contract.symbol());
        tokenTotalSupply.innerText = await contract.totalSupply();
        console.log(await contract.totalSupply());
        tokenName.innerText = await contract.name();
        user_address = await signer.getAddress();
        tokenBalance.innerText = await contract.balanceOf(user_address);
    }
    else {
        alert("Install Metamask!")
    }
}

window.onload = init();

transactionForm.addEventListener('submit', async () => {
    try {
    const Sum = transactionSum.value.trim();
    const Address = transactionAccount.value.trim();
    const tx = await contract.transfer(Address, Sum);
    const tx_data = tx.wait();
    if (tx_data.status == 0) {
        alert("При проведении транзакциии произошла ошибка!");
    }
    else{
        alert("Перевод успешно выполнен!");
    }
    } catch (error) {
        console.log("Transaction error:", error);    
    }
})