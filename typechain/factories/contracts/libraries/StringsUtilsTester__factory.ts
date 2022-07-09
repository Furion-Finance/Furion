/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { PromiseOrValue } from "../../../common";
import type {
  StringsUtilsTester,
  StringsUtilsTesterInterface,
} from "../../../contracts/libraries/StringsUtilsTester";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
    ],
    name: "addressToString",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_bytes",
        type: "bytes32",
      },
    ],
    name: "byToString",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "uintToHexString",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "length",
        type: "uint256",
      },
    ],
    name: "uintToHexString",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "uintToString",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610634806100206000396000f3fe608060405234801561001057600080fd5b50600436106100675760003560e01c8063e455ad6211610050578063e455ad62146100a8578063e9395679146100bb578063eeba0248146100ce57600080fd5b8063232f06b71461006c5780635e57966d14610095575b600080fd5b61007f61007a366004610463565b6100e1565b60405161008c919061047c565b60405180910390f35b61007f6100a33660046104d1565b6100f2565b61007f6100b6366004610463565b6100fd565b61007f6100c9366004610463565b610108565b61007f6100dc366004610507565b610113565b60606100ec82610126565b92915050565b60606100ec82610185565b60606100ec826101a8565b60606100ec826101b5565b606061011f83836102b6565b9392505050565b6060816000036101505750506040805180820190915260048152630307830360e41b602082015290565b8160005b811561017357806101648161053f565b915050600882901c9150610154565b61017d84826102b6565b949350505050565b60606100ec8273ffffffffffffffffffffffffffffffffffffffff1660146102b6565b60606100ec8260206102b6565b6060816000036101dc5750506040805180820190915260018152600360fc1b602082015290565b8160005b811561020657806101f08161053f565b91506101ff9050600a8361056e565b91506101e0565b60008167ffffffffffffffff81111561022157610221610582565b6040519080825280601f01601f19166020018201604052801561024b576020820181803683370190505b5090505b841561017d57610260600183610598565b915061026d600a866105af565b6102789060306105c3565b60f81b81838151811061028d5761028d6105db565b60200101906001600160f81b031916908160001a9053506102af600a8661056e565b945061024f565b606060006102c58360026105f1565b6102d09060026105c3565b67ffffffffffffffff8111156102e8576102e8610582565b6040519080825280601f01601f191660200182016040528015610312576020820181803683370190505b509050600360fc1b8160008151811061032d5761032d6105db565b60200101906001600160f81b031916908160001a905350600f60fb1b8160018151811061035c5761035c6105db565b60200101906001600160f81b031916908160001a90535060006103808460026105f1565b61038b9060016105c3565b90505b6001811115610410577f303132333435363738396162636465660000000000000000000000000000000085600f16601081106103cc576103cc6105db565b1a60f81b8282815181106103e2576103e26105db565b60200101906001600160f81b031916908160001a90535060049490941c9361040981610610565b905061038e565b50831561011f5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e74604482015260640160405180910390fd5b60006020828403121561047557600080fd5b5035919050565b600060208083528351808285015260005b818110156104a95785810183015185820160400152820161048d565b818111156104bb576000604083870101525b50601f01601f1916929092016040019392505050565b6000602082840312156104e357600080fd5b813573ffffffffffffffffffffffffffffffffffffffff8116811461011f57600080fd5b6000806040838503121561051a57600080fd5b50508035926020909101359150565b634e487b7160e01b600052601160045260246000fd5b60006001820161055157610551610529565b5060010190565b634e487b7160e01b600052601260045260246000fd5b60008261057d5761057d610558565b500490565b634e487b7160e01b600052604160045260246000fd5b6000828210156105aa576105aa610529565b500390565b6000826105be576105be610558565b500690565b600082198211156105d6576105d6610529565b500190565b634e487b7160e01b600052603260045260246000fd5b600081600019048311821515161561060b5761060b610529565b500290565b60008161061f5761061f610529565b50600019019056fea164736f6c634300080d000a";

type StringsUtilsTesterConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: StringsUtilsTesterConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class StringsUtilsTester__factory extends ContractFactory {
  constructor(...args: StringsUtilsTesterConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<StringsUtilsTester> {
    return super.deploy(overrides || {}) as Promise<StringsUtilsTester>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): StringsUtilsTester {
    return super.attach(address) as StringsUtilsTester;
  }
  override connect(signer: Signer): StringsUtilsTester__factory {
    return super.connect(signer) as StringsUtilsTester__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StringsUtilsTesterInterface {
    return new utils.Interface(_abi) as StringsUtilsTesterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StringsUtilsTester {
    return new Contract(address, _abi, signerOrProvider) as StringsUtilsTester;
  }
}