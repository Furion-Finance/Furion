/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides, Signer, utils } from "ethers";

import type { PromiseOrValue } from "../../../common";
import type { SimplePriceOracle, SimplePriceOracleInterface } from "../../../contracts/money-market/SimplePriceOracle";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "previousPriceMantissa",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "requestedPriceMantissa",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newPriceMantissa",
        type: "uint256",
      },
    ],
    name: "PricePosted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_asset",
        type: "address",
      },
    ],
    name: "assetPrices",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
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
        internalType: "address",
        name: "_fToken",
        type: "address",
      },
    ],
    name: "getUnderlyingPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
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
        internalType: "address",
        name: "_asset",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_decimal",
        type: "uint256",
      },
    ],
    name: "setDirectPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_fToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_underlyingPriceMantissa",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_decimal",
        type: "uint256",
      },
    ],
    name: "setUnderlyingPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610542806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80635e901bdf146100515780635e9a523c14610066578063c30f14e9146100b3578063fc57d4df146100c6575b600080fd5b61006461005f3660046103b0565b6100d9565b005b61009a6100743660046103e5565b6001600160a01b0316600090815260208181526040808320546001909252909120549091565b6040805192835260208301919091520160405180910390f35b6100646100c13660046103b0565b61015c565b61009a6100d43660046103e5565b6101ef565b6001600160a01b03831660008181526020818152604091829020548251938452908301528101839052606081018390527fdd71a1d19fcba687442a1d5c58578f1e409af71a79d10fd95a4d66efd8fa9ae79060800160405180910390a16001600160a01b0390921660009081526020818152604080832093909355600190522055565b60006101678461022a565b6001600160a01b03811660008181526020818152604091829020548251938452908301528101859052606081018590529091507fdd71a1d19fcba687442a1d5c58578f1e409af71a79d10fd95a4d66efd8fa9ae79060800160405180910390a16001600160a01b03166000908152602081815260408083209490945560019052919091205550565b60008060006101fd8461022a565b6001600160a01b031660009081526020818152604080832054600190925290912054909590945092505050565b60006102b7826001600160a01b03166395d89b416040518163ffffffff1660e01b8152600401600060405180830381865afa15801561026d573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610295919081019061044f565b604051806040016040528060048152602001630cc8aa8960e31b81525061033f565b156102d7575073eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee919050565b816001600160a01b0316639816f4736040518163ffffffff1660e01b8152600401602060405180830381865afa158015610315573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061033991906104fc565b92915050565b6000816040516020016103529190610519565b60405160208183030381529060405280519060200120836040516020016103799190610519565b6040516020818303038152906040528051906020012014905092915050565b6001600160a01b03811681146103ad57600080fd5b50565b6000806000606084860312156103c557600080fd5b83356103d081610398565b95602085013595506040909401359392505050565b6000602082840312156103f757600080fd5b813561040281610398565b9392505050565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561043a578181015183820152602001610422565b83811115610449576000848401525b50505050565b60006020828403121561046157600080fd5b815167ffffffffffffffff8082111561047957600080fd5b818401915084601f83011261048d57600080fd5b81518181111561049f5761049f610409565b604051601f8201601f19908116603f011681019083821181831017156104c7576104c7610409565b816040528281528760208487010111156104e057600080fd5b6104f183602083016020880161041f565b979650505050505050565b60006020828403121561050e57600080fd5b815161040281610398565b6000825161052b81846020870161041f565b919091019291505056fea164736f6c634300080d000a";

type SimplePriceOracleConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (xs: SimplePriceOracleConstructorParams): xs is ConstructorParameters<typeof ContractFactory> =>
  xs.length > 1;

export class SimplePriceOracle__factory extends ContractFactory {
  constructor(...args: SimplePriceOracleConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<SimplePriceOracle> {
    return super.deploy(overrides || {}) as Promise<SimplePriceOracle>;
  }
  override getDeployTransaction(overrides?: Overrides & { from?: PromiseOrValue<string> }): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): SimplePriceOracle {
    return super.attach(address) as SimplePriceOracle;
  }
  override connect(signer: Signer): SimplePriceOracle__factory {
    return super.connect(signer) as SimplePriceOracle__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SimplePriceOracleInterface {
    return new utils.Interface(_abi) as SimplePriceOracleInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): SimplePriceOracle {
    return new Contract(address, _abi, signerOrProvider) as SimplePriceOracle;
  }
}
