/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { EventFragment, FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";

import type { OnEvent, PromiseOrValue, TypedEvent, TypedEventFilter, TypedListener } from "../../common";

export interface AggregatePoolFactoryInterface extends utils.Interface {
  functions: {
    "allPoolsLength()": FunctionFragment;
    "checker()": FunctionFragment;
    "createPool(address[],string,string)": FunctionFragment;
    "fur()": FunctionFragment;
    "getPool(uint256)": FunctionFragment;
    "incomeMaker()": FunctionFragment;
    "oracle()": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setFur(address)": FunctionFragment;
    "spFactory()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "allPoolsLength"
      | "checker"
      | "createPool"
      | "fur"
      | "getPool"
      | "incomeMaker"
      | "oracle"
      | "owner"
      | "renounceOwnership"
      | "setFur"
      | "spFactory"
      | "transferOwnership",
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "allPoolsLength", values?: undefined): string;
  encodeFunctionData(functionFragment: "checker", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "createPool",
    values: [PromiseOrValue<string>[], PromiseOrValue<string>, PromiseOrValue<string>],
  ): string;
  encodeFunctionData(functionFragment: "fur", values?: undefined): string;
  encodeFunctionData(functionFragment: "getPool", values: [PromiseOrValue<BigNumberish>]): string;
  encodeFunctionData(functionFragment: "incomeMaker", values?: undefined): string;
  encodeFunctionData(functionFragment: "oracle", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
  encodeFunctionData(functionFragment: "setFur", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "spFactory", values?: undefined): string;
  encodeFunctionData(functionFragment: "transferOwnership", values: [PromiseOrValue<string>]): string;

  decodeFunctionResult(functionFragment: "allPoolsLength", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "checker", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "createPool", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "fur", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getPool", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "incomeMaker", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "oracle", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setFur", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "spFactory", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
    "PoolCreated(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PoolCreated"): EventFragment;
}

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<[string, string], OwnershipTransferredEventObject>;

export type OwnershipTransferredEventFilter = TypedEventFilter<OwnershipTransferredEvent>;

export interface PoolCreatedEventObject {
  poolAddress: string;
  id: BigNumber;
}
export type PoolCreatedEvent = TypedEvent<[string, BigNumber], PoolCreatedEventObject>;

export type PoolCreatedEventFilter = TypedEventFilter<PoolCreatedEvent>;

export interface AggregatePoolFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AggregatePoolFactoryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    allPoolsLength(overrides?: CallOverrides): Promise<[BigNumber]>;

    checker(overrides?: CallOverrides): Promise<[string]>;

    createPool(
      _tokens: PromiseOrValue<string>[],
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    fur(overrides?: CallOverrides): Promise<[string]>;

    getPool(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;

    incomeMaker(overrides?: CallOverrides): Promise<[string]>;

    oracle(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<ContractTransaction>;

    setFur(
      _newFur: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    spFactory(overrides?: CallOverrides): Promise<[string]>;

    transferOwnership(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;
  };

  allPoolsLength(overrides?: CallOverrides): Promise<BigNumber>;

  checker(overrides?: CallOverrides): Promise<string>;

  createPool(
    _tokens: PromiseOrValue<string>[],
    _name: PromiseOrValue<string>,
    _symbol: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  fur(overrides?: CallOverrides): Promise<string>;

  getPool(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;

  incomeMaker(overrides?: CallOverrides): Promise<string>;

  oracle(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<ContractTransaction>;

  setFur(
    _newFur: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  spFactory(overrides?: CallOverrides): Promise<string>;

  transferOwnership(
    _newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  callStatic: {
    allPoolsLength(overrides?: CallOverrides): Promise<BigNumber>;

    checker(overrides?: CallOverrides): Promise<string>;

    createPool(
      _tokens: PromiseOrValue<string>[],
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<string>;

    fur(overrides?: CallOverrides): Promise<string>;

    getPool(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;

    incomeMaker(overrides?: CallOverrides): Promise<string>;

    oracle(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    setFur(_newFur: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;

    spFactory(overrides?: CallOverrides): Promise<string>;

    transferOwnership(_newOwner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "OwnershipTransferred(address,address)"(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null,
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null,
    ): OwnershipTransferredEventFilter;

    "PoolCreated(address,uint256)"(poolAddress?: null, id?: null): PoolCreatedEventFilter;
    PoolCreated(poolAddress?: null, id?: null): PoolCreatedEventFilter;
  };

  estimateGas: {
    allPoolsLength(overrides?: CallOverrides): Promise<BigNumber>;

    checker(overrides?: CallOverrides): Promise<BigNumber>;

    createPool(
      _tokens: PromiseOrValue<string>[],
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    fur(overrides?: CallOverrides): Promise<BigNumber>;

    getPool(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;

    incomeMaker(overrides?: CallOverrides): Promise<BigNumber>;

    oracle(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<BigNumber>;

    setFur(
      _newFur: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    spFactory(overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    allPoolsLength(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    checker(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    createPool(
      _tokens: PromiseOrValue<string>[],
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    fur(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getPool(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    incomeMaker(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    oracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<PopulatedTransaction>;

    setFur(
      _newFur: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    spFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transferOwnership(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;
  };
}
