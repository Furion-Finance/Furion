/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { Provider } from "@ethersproject/providers";
import { Contract, Signer, utils } from "ethers";

import type {
  IAggregatePool,
  IAggregatePoolInterface,
} from "../../../../contracts/aggregate-pool/interfaces/IAggregatePool";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_newOwner",
        type: "address",
      },
    ],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
    ],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IAggregatePool__factory {
  static readonly abi = _abi;
  static createInterface(): IAggregatePoolInterface {
    return new utils.Interface(_abi) as IAggregatePoolInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): IAggregatePool {
    return new Contract(address, _abi, signerOrProvider) as IAggregatePool;
  }
}
