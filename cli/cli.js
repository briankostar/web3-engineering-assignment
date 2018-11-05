const fs = require('fs');
const Web3 = require('web3');
const dotenv = require('dotenv')
const envConf = dotenv.config().parsed; //To use in production

//Update config to use
const config = {
    "NETWORK": "http://127.0.0.1:8545",
    "DEFAUT_ACCOUNT": '0xc782f1e484b190237f003ea056f6ba18b553fce0',
    "GAS": "4712388",
    "GAS_PRICE": '100000000000'
}

const sendOption = {
    from: config.DEFAUT_ACCOUNT,
    gas: config.GAS,
    gasPrice: config.GAS_PRICE
}

const web3 = new Web3(new Web3.providers.HttpProvider(config.NETWORK))

web3.eth.defaultAccount = config.DEFAUT_ACCOUNT;

let jsonFile = "./build/contracts/CommitReveal.json";
let contractFile = JSON.parse(fs.readFileSync(jsonFile));
let abi = contractFile.abi;

const main = async () => {
    let myBalanceWei = await web3.eth.getBalance(web3.eth.defaultAccount)
    let myBalance = await web3.utils.fromWei(myBalanceWei, 'ether')

    console.log('My ether is', myBalance)

    let CommitRevealContract = new web3.eth.Contract(abi)
    await CommitRevealContract.deploy({ data: contractFile.bytecode, arguments: [3, "YES", "NO"] })
        // use truffle default values
        .send(sendOption, (error, transactionHash) => { console.log('error, trxhash', error, transactionHash) })
        .on('error', (error) => { console.log('error') })
        .on('transactionHash', (transactionHash) => { console.log('transactionHash', transactionHash) })
        .on('receipt', (receipt) => { console.log('receipt', receipt) })
        .on('confirmation', (confirmationNumber, receipt) => { console.log('confirm', confirmationNumber, receipt) })
        .then((newContractInstance) => {
            CommitRevealContract.options.address = newContractInstance.options.address;
            console.log('newContractInstance', newContractInstance.options.address) // instance with the new contract address
        })
        .catch((error) => {
            console.log('Error Occured', error)
        })

    CommitRevealContract.methods.commitVote("0xe01c30ed9fc405f6f7cc0c26e92542fcbecd4f3566149d5bc42f4d38cd7bbee4")
        .send(sendOption)

    setTimeout(() => {
        console.log('reavealing')
        CommitRevealContract.methods.revealVote("1-password1", "0xe01c30ed9fc405f6f7cc0c26e92542fcbecd4f3566149d5bc42f4d38cd7bbee4")
            .send(sendOption)

    }, 2000)

    setTimeout(async () => {

        console.log('getWinner', await CommitRevealContract.methods.getWinner().call())
    }, 4000)

}

main();