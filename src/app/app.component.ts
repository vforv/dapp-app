import { Component } from '@angular/core';
import Web3 from 'web3';
import { ABI, BYTECODE } from './contract';
import { Observable } from 'rxjs';

const TESTNET_URL = 'https://ropsten.etherscan.io/';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private static _instance: AppComponent;

  private isConnection: boolean = false;
  private web3: Web3;
  private version: string;
  private accounts: [string];
  private coinbase: string;
  private balance: number;
  private currentAccount: string;
  private transactionUrl: string;
  public contractObject: string;
  private password: string;
  private setnum: number;

  constructor() {

    if (typeof this.web3 !== 'undefined') {
      this.web3 = new Web3(this.web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

  }

  public static get Instance() {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this());
  }

  private checkConnection() {
    // Set the connect status on the app
    if (this.web3) {

      // Gets the version data and populates the result UI
      this.version = this.web3.version;

      this.web3.eth.getAccounts((error, result: [string]) => {
        if (error) {
          console.log(error);
        } else {
          this.accounts = result;

        }
      });


      this.isConnection = true;

    } else {
      this.isConnection = false;

    }
  }

  private getBalance(address: string) {

    this.web3.eth.getBalance(address)
      .then((result: number) => {
        this.balance = this.web3.utils.fromWei(result, 'ether');
        this.currentAccount = address;
      })
      .catch((error) => {
        console.log(error)
      });

  }

  private unlockAccount(address: any) {
    this.web3.eth.personal.unlockAccount(address, this.password);
  }

  private lockAccount(address: any) {
    this.web3.eth.personal.lockAccount(address)
  }

  /**
   * Send transcation to another account
   * @param param0 
   */
  private sendTransaction({ value, valid }) {
    let transactionObject = {
      from: value.address1,
      to: value.address2,
      value: this.web3.utils.toWei("1", 'ether'),
      // gas: '5000000000',
      // gasPrice: '5000000000',
      data: this.web3.utils.toHex("Gj Vladimir transaction sent!")
    };

    this.web3.eth.sendTransaction(transactionObject, (err, res) => {
      if (err) {
        console.log(err)
      } else {

        this.transactionUrl = `${TESTNET_URL}tx/${res}`
      }
    });

  }

  /**
   * Add contract to Ethereum network
   */
  private deployContract() {
    let abi = ABI;
    let bytecode = BYTECODE;

    let contract = new this.web3.eth.Contract(abi);

    contract
      .deploy({
        data: bytecode,
        arguments: [123]
      })
      .send({
        from: '0xCe235f14b563922254D8b4424101147E386e070E',
        gas: '470000'
        // gasPrice: '470000'
      })
      .on('transactionHash', (transactionHash) => {

        this.transactionUrl = `${TESTNET_URL}tx/${transactionHash}`
      })
  }


  private callContractSet() {
    let contract = new this.web3.eth.Contract(ABI, '0xfb878279ebc9d163bcf4241e4ed77de1e8b1d4ee');

    contract.methods.setNum(this.setnum).send({
        from: '0xCe235f14b563922254D8b4424101147E386e070E',
        gas: '470000'
        // gasPrice: '470000'
      })
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })
  }

  private callContractGet() {
    let contract = new this.web3.eth.Contract(ABI, '0xfb878279ebc9d163bcf4241e4ed77de1e8b1d4ee');

    contract.methods.getNum().call()
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })
  }
  
}
