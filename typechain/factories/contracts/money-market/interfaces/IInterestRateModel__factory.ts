/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { Provider } from "@ethersproject/providers";
import { Contract, Signer, utils } from "ethers";

import type {
  IInterestRateModel,
  IInterestRateModelInterface,
} from "../../../../contracts/money-market/interfaces/IInterestRateModel";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cash",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_borrows",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_reserves",
        type: "uint256",
      },
    ],
    name: "getBorrowRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cash",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_borrows",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_reserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_reserveFactorMantissa",
        type: "uint256",
      },
    ],
    name: "getSupplyRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isInterestRateModel",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class IInterestRateModel__factory {
  static readonly abi = _abi;
  static createInterface(): IInterestRateModelInterface {
    return new utils.Interface(_abi) as IInterestRateModelInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): IInterestRateModel {
    return new Contract(address, _abi, signerOrProvider) as IInterestRateModel;
  }
}
