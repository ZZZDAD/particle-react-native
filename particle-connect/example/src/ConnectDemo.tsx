import React, { PureComponent } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  ChainInfo,
  PolygonMumbai,
  SolanaDevnet,
  Ethereum,
  Polygon,
  EthereumGoerli,
  EthereumSepolia,
} from '@particle-network/chains';
import * as particleConnect from 'react-native-particle-connect';
import { SocialLoginPrompt } from 'react-native-particle-auth';
import * as particleAuth from 'react-native-particle-auth';
import { TestAccountEVM, TestAccountSolana } from './TestAccount';
import * as Helper from './Helper';
import { WalletType } from 'react-native-particle-connect';
import {
  ParticleConnectConfig,
  DappMetaData
} from 'react-native-particle-connect';
import { PNAccount } from './Models/PNAccount';
import {
  ParticleInfo,
  Env,
  LoginType,
  SupportAuthType,
} from 'react-native-particle-auth';
import { createWeb3, restoreWeb3 } from './web3Demo';
import BigNumber from 'bignumber.js';

import type { NavigationProp, RouteProp } from '@react-navigation/native';

interface ConnectDemoProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any, any>;
}

export default class ConnectDemo extends PureComponent<ConnectDemoProps> {
  loginSourceMessage = '';
  loginSignature = '';

  pnaccount = new PNAccount([], '', '', '');

  // Start with new web3, at this time, you don't connect with this walletType, and don't know any publicAddress
  newWeb3: any;

  // After connected a wallet, restoreWeb3 when getAccounts.
  // We need to check if the walletType and publicAddress is connected.
  web3: any;

  init = () => {
    // Get your project id and client from dashboard,
    // https://dashboard.particle.network/

    ParticleInfo.projectId = '5479798b-26a9-4943-b848-649bb104fdc3'; // your project id
    ParticleInfo.clientKey = 'cUKfeOA7rnNFCxSBtXE5byLgzIhzGrE4Y7rDdY4b'; // your client key

    if (ParticleInfo.projectId == '' || ParticleInfo.clientKey == '') {
      throw new Error(
        'You need set project info, Get your project id and client from dashboard, https://dashboard.particle.network'
      );
    }

    const chainInfo: ChainInfo = Ethereum;
    const env = Env.Dev;
    const metadata = new DappMetaData(
      '75ac08814504606fc06126541ace9df6',
      'Particle Connect',
      'https://connect.particle.network/icons/512.png',
      'https://connect.particle.network',
      'Particle Wallet',
      '',
      ''
    );

    // the rpcUrl works for WalletType EvmPrivateKey and SolanaPrivakey
    // we have default rpc url in native SDK
    particleConnect.init(chainInfo, env, metadata);

    this.newWeb3 = createWeb3(
      '5479798b-26a9-4943-b848-649bb104fdc3',
      'cUKfeOA7rnNFCxSBtXE5byLgzIhzGrE4Y7rDdY4b',
      PNAccount.walletType
    );

    // const chainInfos = [Ethereum, Polygon, EthereumGoerli, EthereumSepolia];
    // particleConnect.setWalletConnectV2SupportChainInfos(chainInfos);
  };

  newWeb3_getAccounts = async () => {
    try {
      const accounts = await this.newWeb3.eth.getAccounts();
      this.pnaccount = new PNAccount([], '', accounts[0], '');
      console.log('web3.eth.getAccounts', accounts);
    } catch (error) {
      console.log('web3.eth.getAccounts', error);
    }
  };

  restoreWeb3_getAccounts = async () => {
    try {
      console.log('pnaccount.publicAddress ', this.pnaccount.publicAddress);
      this.web3 = restoreWeb3(
        '5479798b-26a9-4943-b848-649bb104fdc3',
        'cUKfeOA7rnNFCxSBtXE5byLgzIhzGrE4Y7rDdY4b',
        PNAccount.walletType,
        this.pnaccount.publicAddress
      );

      const accounts = await this.web3.eth.getAccounts();
      this.pnaccount = new PNAccount([], '', accounts[0], '');
      console.log('web3.eth.getAccounts', accounts);
    } catch (error) {
      console.log('web3.eth.getAccounts', error);
    }
  };

  web3_getBalance = async () => {
    try {
      const accounts = await this.web3.eth.getAccounts();
      const balance = await this.web3.eth.getBalance(accounts[0]);
      console.log('web3.eth.getBalance', balance);
    } catch (error) {
      console.log('web3.eth.getBalance', error);
    }
  };

  web3_getChainId = async () => {
    try {
      const chainId = await this.web3.eth.getChainId();
      console.log('web3.eth.getChainId', chainId);
    } catch (error) {
      console.log('web3.eth.getChainId', error);
    }
  };

  web3_personalSign = async () => {
    // for persion_sign
    // don't use web3.eth.personal.sign

    try {
      const accounts = await this.web3.eth.getAccounts();
      const result = await this.web3.currentProvider.request({
        method: 'personal_sign',
        params: ['Hello world', accounts[0]],
      });

      console.log('web3.eth.personal.sign', result);
    } catch (error) {
      console.log('web3.eth.personal.sign', error);
    }
  };

  web3_signTypedData_v4 = async () => {
    try {
      // @ts-ignore
      const accounts = await this.web3!.eth.getAccounts();
      const chainId = await this.web3.eth.getChainId();
      // @ts-ignore
      const result = await this.web3!.currentProvider.request({
        method: 'eth_signTypedData_v4',
        params: [
          accounts[0],
          {
            types: {
              OrderComponents: [
                { name: 'offerer', type: 'address' },
                { name: 'zone', type: 'address' },
                { name: 'offer', type: 'OfferItem[]' },
                { name: 'consideration', type: 'ConsiderationItem[]' },
                { name: 'orderType', type: 'uint8' },
                { name: 'startTime', type: 'uint256' },
                { name: 'endTime', type: 'uint256' },
                { name: 'zoneHash', type: 'bytes32' },
                { name: 'salt', type: 'uint256' },
                { name: 'conduitKey', type: 'bytes32' },
                { name: 'counter', type: 'uint256' },
              ],
              OfferItem: [
                { name: 'itemType', type: 'uint8' },
                { name: 'token', type: 'address' },
                { name: 'identifierOrCriteria', type: 'uint256' },
                { name: 'startAmount', type: 'uint256' },
                { name: 'endAmount', type: 'uint256' },
              ],
              ConsiderationItem: [
                { name: 'itemType', type: 'uint8' },
                { name: 'token', type: 'address' },
                { name: 'identifierOrCriteria', type: 'uint256' },
                { name: 'startAmount', type: 'uint256' },
                { name: 'endAmount', type: 'uint256' },
                { name: 'recipient', type: 'address' },
              ],
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
              ],
            },
            domain: {
              name: 'Seaport',
              version: '1.1',
              chainId: `${chainId}`,
              verifyingContract: '0x00000000006c3852cbef3e08e8df289169ede581',
            },
            primaryType: 'OrderComponents',
            message: {
              offerer: '0x6fc702d32e6cb268f7dc68766e6b0fe94520499d',
              zone: '0x0000000000000000000000000000000000000000',
              offer: [
                {
                  itemType: '2',
                  token: '0xd15b1210187f313ab692013a2544cb8b394e2291',
                  identifierOrCriteria: '33',
                  startAmount: '1',
                  endAmount: '1',
                },
              ],
              consideration: [
                {
                  itemType: '0',
                  token: '0x0000000000000000000000000000000000000000',
                  identifierOrCriteria: '0',
                  startAmount: '9750000000000000',
                  endAmount: '9750000000000000',
                  recipient: '0x6fc702d32e6cb268f7dc68766e6b0fe94520499d',
                },
                {
                  itemType: '0',
                  token: '0x0000000000000000000000000000000000000000',
                  identifierOrCriteria: '0',
                  startAmount: '250000000000000',
                  endAmount: '250000000000000',
                  recipient: '0x66682e752d592cbb2f5a1b49dd1c700c9d6bfb32',
                },
              ],
              orderType: '0',
              startTime: '1669188008',
              endTime:
                '115792089237316195423570985008687907853269984665640564039457584007913129639935',
              zoneHash:
                '0x3000000000000000000000000000000000000000000000000000000000000000',
              salt: '48774942683212973027050485287938321229825134327779899253702941089107382707469',
              conduitKey:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              counter: '0',
            },
          },
        ],
      });
      console.log('web3 eth_signTypedData_v4', result);
    } catch (error) {
      console.log('web3 eth_signTypedData_v4', error);
    }
  };

  web3_sendTransaction = async () => {
    try {
      // @ts-ignore
      const accounts = await this.web3!.eth.getAccounts();
      // @ts-ignore
      const result = await this.web3!.eth.sendTransaction({
        from: accounts[0],
        to: TestAccountEVM.receiverAddress,
        value: '1000000',
        data: '0x',
      });
      console.log('web3.eth.sendTransaction', result);
    } catch (error) {
      console.log('web3.eth.sendTransaction', error);
    }
  };

  web3_wallet_switchEthereumChain = async () => {
    try {
      const chainInfo: ChainInfo =
        this.props.route.params?.chainInfo || PolygonMumbai;
      const chainId = '0x' + chainInfo.id.toString(16);
      // @ts-ignore
      const result = await this.web3!.currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }],
      });
      console.log('web3 wallet_switchEthereumChain', result);
    } catch (error) {
      console.log('web3 wallet_switchEthereumChain', error);
    }
  };

  web3_wallet_addEthereumChain = async () => {
    try {
      const chainInfo: ChainInfo =
        this.props.route.params?.chainInfo || PolygonMumbai;
      const chainId = '0x' + chainInfo.id.toString(16);
      // @ts-ignore
      const result = await this.web3!.currentProvider.request({
        method: 'wallet_addEthereumChain',
        params: [{ chainId: chainId }],
      });
      console.log('web3 wallet_addEthereumChain', result);
    } catch (error) {
      console.log('web3 wallet_addEthereumChain', error);
    }
  };

  getAccounts = async () => {
    const accounts = await particleConnect.getAccounts(PNAccount.walletType);
    console.log(accounts);
  };

  setChainInfo = async () => {
    const chainInfo: ChainInfo =
      this.props.route.params?.chainInfo || PolygonMumbai;
    const result = await particleAuth.setChainInfo(chainInfo);
    console.log(result);
  };

  getChainInfo = async () => {
    const chainInfo: ChainInfo = await particleAuth.getChainInfo();
    console.log(chainInfo);
  };

  setChainInfoAsync = async () => {
    const chainInfo: ChainInfo =
      this.props.route.params?.chainInfo || PolygonMumbai;
    const result = await particleAuth.setChainInfoAsync(chainInfo);
    console.log(result);
  };

  connect = async () => {
    const result = await particleConnect.connect(PNAccount.walletType);
    if (result.status) {
      console.log('connect success');
      const account = result.data;
      this.pnaccount = new PNAccount(
        account.icons,
        account.name,
        account.publicAddress,
        account.url
      );
      console.log('pnaccount = ', this.pnaccount);
    } else {
      console.log('connect failure');
      const error = result.data;
      console.log(error);
    }
  };

  connectWithParticleConfig = async () => {
    const message = '0x' + Buffer.from("Hello Particle!").toString('hex');
    const authorization = new particleAuth.LoginAuthorization(message, false);
    const connectConfig = new ParticleConnectConfig(LoginType.Phone, '', [
      SupportAuthType.Email,
      SupportAuthType.Google,
      SupportAuthType.Apple,
    ], SocialLoginPrompt.SelectAccount, authorization);

    const result = await particleConnect.connect(
      WalletType.Particle,
      connectConfig
    );
    if (result.status) {
      console.log('connect success');
      const account = result.data;
      this.pnaccount = new PNAccount(
        account.icons,
        account.name,
        account.publicAddress,
        account.url
      );
      console.log('pnaccount = ', this.pnaccount);
    } else {
      console.log('connect failure');
      const error = result.data;
      console.log(error);
    }
  };

  disconnect = async () => {
    const publicAddress = this.pnaccount.publicAddress;
    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }
    const result = await particleConnect.disconnect(
      PNAccount.walletType,
      publicAddress
    );
    if (result.status) {
      console.log(result.data);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  isConnected = async () => {
    const publicAddress = this.pnaccount.publicAddress;
    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }
    const isConnected = await particleConnect.isConnected(
      PNAccount.walletType,
      publicAddress
    );
    console.log(isConnected);
  };

  signMessage = async () => {
    const publicAddress = this.pnaccount.publicAddress;
    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }
    const message = 'Hello world!';
    const result = await particleConnect.signMessage(
      PNAccount.walletType,
      publicAddress,
      message
    );
    if (result.status) {
      const signedMessage = result.data;
      console.log(signedMessage);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  signTransaction = async () => {
    const chainInfo: ChainInfo =
      this.props.route.params?.chainInfo || SolanaDevnet;

    if (chainInfo.name.toLowerCase() != 'solana') {
      console.log('signTransaction only supports solana');
      return;
    }

    const publicAddress = this.pnaccount.publicAddress;
    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }

    const sender = await particleAuth.getAddress();
    console.log('sender: ', sender);
    const transaction = await Helper.getSolanaTransaction(sender);
    console.log('transaction:', transaction);

    const result = await particleConnect.signTransaction(
      PNAccount.walletType,
      publicAddress,
      transaction
    );

    if (result.status) {
      const signedTransaction = result.data;
      console.log(signedTransaction);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  signAllTransactions = async () => {
    const chainInfo: ChainInfo =
      this.props.route.params?.chainInfo || SolanaDevnet;

    if (chainInfo.name.toLowerCase() != 'solana') {
      console.log('signAllTransactions only supports solana');
      return;
    }

    const publicAddress = this.pnaccount.publicAddress;
    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }
    const sender = await particleAuth.getAddress();
    console.log('sender: ', sender);
    const transaction = await Helper.getSolanaTransaction(sender);
    console.log('transaction:', transaction);

    const transactions = [transaction, transaction];
    const result = await particleConnect.signAllTransactions(
      PNAccount.walletType,
      publicAddress,
      transactions
    );
    if (result.status) {
      const signedTransactions = result.data;
      console.log(signedTransactions);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  signAndSendTransaction = async () => {
    const sender = await particleAuth.getAddress();
    const chainInfo: ChainInfo =
      this.props.route.params?.chainInfo || PolygonMumbai;

    const publicAddress = this.pnaccount.publicAddress;

    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }

    let transaction = '';
    if (chainInfo.name.toLowerCase() == 'solana') {
      transaction = await Helper.getSolanaTransaction(sender);
    } else {
      const receiver = TestAccountEVM.receiverAddress;
      const amount = TestAccountEVM.amount;
      transaction = await Helper.getEthereumTransacion(
        this.pnaccount.publicAddress,
        receiver,
        BigNumber(amount)
      );
    }

    console.log(transaction);
    const result = await particleConnect.signAndSendTransaction(
      PNAccount.walletType,
      publicAddress,
      transaction
    );
    if (result.status) {
      const signature = result.data;
      console.log('signAndSendTransaction:', signature);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  signTypedData = async () => {
    const chainInfo: ChainInfo =
      this.props.route.params?.chainInfo || PolygonMumbai;
    if (chainInfo.name.toLowerCase() == 'solana') {
      console.log('signTypedData only supports evm');
      return;
    }

    const typedData = `{"types":{"OrderComponents":[{"name":"offerer","type":"address"},{"name":"zone","type":"address"},{"name":"offer","type":"OfferItem[]"},{"name":"consideration","type":"ConsiderationItem[]"},{"name":"orderType","type":"uint8"},{"name":"startTime","type":"uint256"},{"name":"endTime","type":"uint256"},{"name":"zoneHash","type":"bytes32"},{"name":"salt","type":"uint256"},{"name":"conduitKey","type":"bytes32"},{"name":"counter","type":"uint256"}],"OfferItem":[{"name":"itemType","type":"uint8"},{"name":"token","type":"address"},{"name":"identifierOrCriteria","type":"uint256"},{"name":"startAmount","type":"uint256"},{"name":"endAmount","type":"uint256"}],"ConsiderationItem":[{"name":"itemType","type":"uint8"},{"name":"token","type":"address"},{"name":"identifierOrCriteria","type":"uint256"},{"name":"startAmount","type":"uint256"},{"name":"endAmount","type":"uint256"},{"name":"recipient","type":"address"}],"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}]},"domain":{"name":"Seaport","version":"1.1","chainId":${chainInfo.id},"verifyingContract":"0x00000000006c3852cbef3e08e8df289169ede581"},"primaryType":"OrderComponents","message":{"offerer":"0x6fc702d32e6cb268f7dc68766e6b0fe94520499d","zone":"0x0000000000000000000000000000000000000000","offer":[{"itemType":"2","token":"0xd15b1210187f313ab692013a2544cb8b394e2291","identifierOrCriteria":"33","startAmount":"1","endAmount":"1"}],"consideration":[{"itemType":"0","token":"0x0000000000000000000000000000000000000000","identifierOrCriteria":"0","startAmount":"9750000000000000","endAmount":"9750000000000000","recipient":"0x6fc702d32e6cb268f7dc68766e6b0fe94520499d"},{"itemType":"0","token":"0x0000000000000000000000000000000000000000","identifierOrCriteria":"0","startAmount":"250000000000000","endAmount":"250000000000000","recipient":"0x66682e752d592cbb2f5a1b49dd1c700c9d6bfb32"}],"orderType":"0","startTime":"1669188008","endTime":"115792089237316195423570985008687907853269984665640564039457584007913129639935","zoneHash":"0x3000000000000000000000000000000000000000000000000000000000000000","salt":"48774942683212973027050485287938321229825134327779899253702941089107382707469","conduitKey":"0x0000000000000000000000000000000000000000000000000000000000000000","counter":"0"}}`;
    const publicAddress = this.pnaccount.publicAddress;
    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }
    const result = await particleConnect.signTypedData(
      PNAccount.walletType,
      publicAddress,
      typedData
    );
    if (result.status) {
      const signature = result.data;
      console.log(signature);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  login = async () => {
    const publicAddress = this.pnaccount.publicAddress;

    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }

    const domain = 'login.xyz';
    const uri = 'https://login.xyz/demo#login';
    const result = await particleConnect.login(
      PNAccount.walletType,
      publicAddress,
      domain,
      uri
    );
    if (result.status) {
      const message = result.data.message;
      this.loginSourceMessage = message;
      const signature = result.data.signature;
      this.loginSignature = signature;
      console.log('login message:', message);
      console.log('login signature:', signature);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  verify = async () => {
    const publicAddress = this.pnaccount.publicAddress;
    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }
    const message = this.loginSourceMessage;
    const signature = this.loginSignature;
    if (message == undefined || signature == undefined) {
      console.log('message or signature is underfined');
      return;
    }
    console.log('verify message:', message);
    console.log('verify signature:', signature);
    const result = await particleConnect.verify(
      PNAccount.walletType,
      publicAddress,
      message,
      signature
    );
    if (result.status) {
      const flag = result.data;
      console.log(flag);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  importPrivateKey = async () => {
    // this method only support WalletType is SolanaPrivateKey or EvmPrivateKey
    // we provide a private key for test
    const privateKey = TestAccountEVM.privateKey;
    const result = await particleConnect.importPrivateKey(
      WalletType.EvmPrivateKey,
      privateKey
    );
    if (result.status) {
      const account = result.data;
      console.log(account);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  importMnemonic = async () => {
    // this method only support WalletType is SolanaPrivateKey or EvmPrivateKey
    // we provide a mnemonic for test
    const mnemonic = TestAccountEVM.mnemonic;
    const result = await particleConnect.importMnemonic(
      WalletType.EvmPrivateKey,
      mnemonic
    );
    if (result.status) {
      const account = result.data;
      console.log(account);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  exportPrivateKey = async () => {
    // this method only support WalletType is SolanaPrivateKey or EvmPrivateKey
    const publicAddress = TestAccountEVM.publicAddress;
    const result = await particleConnect.exportPrivateKey(
      WalletType.EvmPrivateKey,
      publicAddress
    );
    if (result.status) {
      const privateKey = result.data;
      console.log(privateKey);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  addEthereumChain = async () => {
    const publicAddress = this.pnaccount.publicAddress;
    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }

    console.log(publicAddress);
    const result = await particleConnect.addEthereumChain(
      PNAccount.walletType,
      publicAddress,
      PolygonMumbai
    );

    if (result.status) {
      const data = result.data;
      console.log(data);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  switchEthereumChain = async () => {
    const publicAddress = this.pnaccount.publicAddress;

    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }

    const result = await particleConnect.switchEthereumChain(
      PNAccount.walletType,
      publicAddress,
      PolygonMumbai
    );

    if (result.status) {
      const data = result.data;
      console.log(data);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  reconnectIfNeeded = async () => {
    const publicAddress = TestAccountEVM.publicAddress;

    if (publicAddress == undefined) {
      console.log('publicAddress is underfined, you need connect');
      return;
    }

    const result = await particleConnect.reconnectIfNeeded(
      PNAccount.walletType,
      publicAddress
    );

    if (result.status) {
      const data = result.data;
      console.log(data);
    } else {
      const error = result.data;
      console.log(error);
    }
  };

  data = [
    { key: 'Select Chain Page', function: null },
    { key: 'Select Wallet Type Page', function: null },
    { key: 'Init', function: this.init },

    { key: 'newWeb3_getAccounts', function: this.newWeb3_getAccounts },
    { key: 'restoreWeb3_getAccounts', function: this.restoreWeb3_getAccounts },
    { key: 'web3_getBalance', function: this.web3_getBalance },
    { key: 'web3_getChainId', function: this.web3_getChainId },
    { key: 'web3_personalSign', function: this.web3_personalSign },
    { key: 'web3_signTypedData_v4', function: this.web3_signTypedData_v4 },
    { key: 'web3_sendTransaction', function: this.web3_sendTransaction },
    {
      key: 'web3_wallet_switchEthereumChain',
      function: this.web3_wallet_switchEthereumChain,
    },
    {
      key: 'web3_wallet_addEthereumChain',
      function: this.web3_wallet_addEthereumChain,
    },

    { key: 'SetChainInfo', function: this.setChainInfo },
    { key: 'SetChainInfoAsync', function: this.setChainInfoAsync },
    { key: 'GetChainInfo', function: this.getChainInfo },
    { key: 'GetAccounts', function: this.getAccounts },
    { key: 'Connect', function: this.connect },
    {
      key: 'ConnectWithParticleConfig',
      function: this.connectWithParticleConfig,
    },
    { key: 'Disconnect', function: this.disconnect },
    { key: 'IsConnected', function: this.isConnected },
    { key: 'SignMessage', function: this.signMessage },
    { key: 'SignTransaction', function: this.signTransaction },
    { key: 'SignAllTransactions', function: this.signAllTransactions },
    { key: 'SignAndSendTransaction', function: this.signAndSendTransaction },
    { key: 'SignTypedData', function: this.signTypedData },
    { key: 'Login', function: this.login },
    { key: 'Verify', function: this.verify },
    { key: 'ImportPrivateKey', function: this.importPrivateKey },
    { key: 'ImportMnemonic', function: this.importMnemonic },
    { key: 'ExportPrivateKey', function: this.exportPrivateKey },
    { key: 'AddEthereumChain', function: this.addEthereumChain },
    { key: 'SwitchEthereumChain', function: this.switchEthereumChain },
    { key: 'ReconnectIfNeeded', function: this.reconnectIfNeeded },
  ];

  render = () => {
    const { navigation, route } = this.props;

    return (
      <SafeAreaView>
        <FlatList
          data={this.data}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.buttonStyle}
              onPress={() => {
                if (item.key == 'Select Chain Page') {
                  // @ts-ignore
                  navigation.push('SelectChainPage');
                } else if (item.key == 'Select Wallet Type Page') {
                  // @ts-ignore
                  navigation.push('SelectWalletTypePage');
                } else {
                  // @ts-ignore
                  item.function();
                }
              }}
            >
              <Text style={styles.textStyle}>{item.key}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  };
}

const styles = StyleSheet.create({
  buttonStyle: {
    backgroundColor: 'rgba(78, 116, 289, 1)',
    borderRadius: 3,
    margin: 10,
    height: 30,
    width: 300,
    justifyContent: 'center',
  },

  textStyle: {
    color: 'white',
    textAlign: 'center',
  },
});