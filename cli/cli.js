const fs = require('fs');
const Web3 = require('web3');

const network = 'http://127.0.0.1:8545'
const web3 = new Web3(new Web3.providers.HttpProvider(network))

web3.eth.defaultAccount = '0xc782f1e484b190237f003ea056f6ba18b553fce0';

let jsonFile = "./build/contracts/CommitReveal.json";
let contractFile = JSON.parse(fs.readFileSync(jsonFile));
let abi = contractFile.abi;


const main = async () => {
    let myBalanceWei = await web3.eth.getBalance(web3.eth.defaultAccount)
    let myBalance = await web3.utils.fromWei(myBalanceWei, 'ether')

    console.log('My ether is', myBalance)

    let CommitRevealContract = new web3.eth.Contract(abi)
    let deployed = await CommitRevealContract.deploy({ data: contractFile.bytecode, arguments: [3, "YES", "NO"] })
        // use truffle default values
        .send({
            from: '0xc782f1e484b190237f003ea056f6ba18b553fce0',
            gas: 4712388,
            gasPrice: '100000000000'
        }, function (error, transactionHash) { console.log('error, trxhash', transactionHash) })
        .on('error', function (error) { console.log('error') })
        .on('transactionHash', function (transactionHash) { console.log('trx hash', transactionHash) })
        .on('receipt', function (receipt) {
            console.log('receipt', receipt.contractAddress) // contains the new contract address
        })
        // .on('confirmation', function (confirmationNumber, receipt) { console.log('confirm', confirmationNumber, receipt) })
        .then(function (newContractInstance) {
            CommitRevealContract.options.address = newContractInstance.options.address;
            console.log('newContractInstance', newContractInstance.options.address) // instance with the new contract address
        });

    CommitRevealContract.methods.choice1().estimateGas(function (err, gas) {
        console.log('get choice1 gas', gas);
    });

    CommitRevealContract.methods.commitVote("0xe01c30ed9fc405f6f7cc0c26e92542fcbecd4f3566149d5bc42f4d38cd7bbee4").estimateGas(function (err, gas) {
        console.log('commitVote gas', gas);
    });

    CommitRevealContract.methods.revealVote("1-password1", "0xe01c30ed9fc405f6f7cc0c26e92542fcbecd4f3566149d5bc42f4d38cd7bbee4").estimateGas(function (err, gas) {
        console.log('revealVote gas', err, gas);
    });

    CommitRevealContract.methods.commitVote("0xe01c30ed9fc405f6f7cc0c26e92542fcbecd4f3566149d5bc42f4d38cd7bbee4")
        .send({
            from: '0xc782f1e484b190237f003ea056f6ba18b553fce0',
            gas: 4712388,
            gasPrice: '100000000000'
        })

    setTimeout(() => {
        console.log('reavealing')
        CommitRevealContract.methods.revealVote("1-password1", "0xe01c30ed9fc405f6f7cc0c26e92542fcbecd4f3566149d5bc42f4d38cd7bbee4")
            .send({
                from: '0xc782f1e484b190237f003ea056f6ba18b553fce0',
                gas: 4712388,
                gasPrice: '100000000000'
            })

    }, 2000)

    setTimeout(async () => {

        console.log('getWinner', await CommitRevealContract.methods.getWinner().call())
    }, 4000)


}

main();