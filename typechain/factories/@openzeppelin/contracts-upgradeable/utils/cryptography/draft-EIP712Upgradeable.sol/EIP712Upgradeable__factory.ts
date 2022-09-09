/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { Provider } from "@ethersproject/providers";
import { Contract, Signer, utils } from "ethers";

import type {
  EIP712Upgradeable,
  EIP712UpgradeableInterface,
} from "../../../../../../@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol/EIP712Upgradeable";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
];

export class EIP712Upgradeable__factory {
  static readonly abi = _abi;
  static createInterface(): EIP712UpgradeableInterface {
    return new utils.Interface(_abi) as EIP712UpgradeableInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): EIP712Upgradeable {
    return new Contract(address, _abi, signerOrProvider) as EIP712Upgradeable;
  }
}
