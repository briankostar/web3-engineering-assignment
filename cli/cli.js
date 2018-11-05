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
    let deployed = await CommitRevealContract.deploy({ data: contractFile.bytecode, arguments: [120, "YES", "NO"] })
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
    // .estimateGas(function (err, gas) {
    //     console.log(gas);
    // });

    // .then(function (choice1) {
    console.log('methods', CommitRevealContract.methods)
    console.log('choice1', await CommitRevealContract.methods.choice2().call())
    console.log('endtime', await CommitRevealContract.methods.commitPhaseEndTime().call())
    // console.log('getWinner', await CommitRevealContract.methods.getWinner().call())
}

main();