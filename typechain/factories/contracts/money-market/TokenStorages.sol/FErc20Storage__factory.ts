/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides, Signer, utils } from "ethers";

import type { PromiseOrValue } from "../../../../common";
import type {
  FErc20Storage,
  FErc20StorageInterface,
} from "../../../../contracts/money-market/TokenStorages.sol/FErc20Storage";

const _abi = [
  {
    inputs: [],
    name: "underlying",
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
];

const _bytecode =
  "0x6080604052348015600f57600080fd5b5060828061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80636f307dc314602d575b600080fd5b600054604c9073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200160405180910390f3fea164736f6c634300080d000a";

type FErc20StorageConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (xs: FErc20StorageConstructorParams): xs is ConstructorParameters<typeof ContractFactory> =>
  xs.length > 1;

export class FErc20Storage__factory extends ContractFactory {
  constructor(...args: FErc20StorageConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<FErc20Storage> {
    return super.deploy(overrides || {}) as Promise<FErc20Storage>;
  }
  override getDeployTransaction(overrides?: Overrides & { from?: PromiseOrValue<string> }): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FErc20Storage {
    return super.attach(address) as FErc20Storage;
  }
  override connect(signer: Signer): FErc20Storage__factory {
    return super.connect(signer) as FErc20Storage__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FErc20StorageInterface {
    return new utils.Interface(_abi) as FErc20StorageInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): FErc20Storage {
    return new Contract(address, _abi, signerOrProvider) as FErc20Storage;
  }
}