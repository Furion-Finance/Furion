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

export interface IncomeMakerInterface extends utils.Interface {
  functions: {
    "PRICE_SCALE()": FunctionFragment;
    "collectIncomeFromSwap(address,address)": FunctionFragment;
    "emergencyWithdraw(address,uint256)": FunctionFragment;
    "factory()": FunctionFragment;
    "incomeProportion()": FunctionFragment;
    "incomeSharingVault()": FunctionFragment;
    "incomeToken()": FunctionFragment;
    "initialize(address,address,address,address)": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "router()": FunctionFragment;
    "setIncomeProportion(uint8)": FunctionFragment;
    "setIncomeToken(address)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "uint_MAX()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "PRICE_SCALE"
      | "collectIncomeFromSwap"
      | "emergencyWithdraw"
      | "factory"
      | "incomeProportion"
      | "incomeSharingVault"
      | "incomeToken"
      | "initialize"
      | "owner"
      | "renounceOwnership"
      | "router"
      | "setIncomeProportion"
      | "setIncomeToken"
      | "transferOwnership"
      | "uint_MAX",
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "PRICE_SCALE", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "collectIncomeFromSwap",
    values: [PromiseOrValue<string>, PromiseOrValue<string>],
  ): string;
  encodeFunctionData(
    functionFragment: "emergencyWithdraw",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(functionFragment: "factory", values?: undefined): string;
  encodeFunctionData(functionFragment: "incomeProportion", values?: undefined): string;
  encodeFunctionData(functionFragment: "incomeSharingVault", values?: undefined): string;
  encodeFunctionData(functionFragment: "incomeToken", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<string>, PromiseOrValue<string>, PromiseOrValue<string>, PromiseOrValue<string>],
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
  encodeFunctionData(functionFragment: "router", values?: undefined): string;
  encodeFunctionData(functionFragment: "setIncomeProportion", values: [PromiseOrValue<BigNumberish>]): string;
  encodeFunctionData(functionFragment: "setIncomeToken", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "transferOwnership", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "uint_MAX", values?: undefined): string;

  decodeFunctionResult(functionFragment: "PRICE_SCALE", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "collectIncomeFromSwap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "emergencyWithdraw", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "factory", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "incomeProportion", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "incomeSharingVault", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "incomeToken", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "router", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setIncomeProportion", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setIncomeToken", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "uint_MAX", data: BytesLike): Result;

  events: {
    "EmergencyWithdraw(address,uint256)": EventFragment;
    "IncomeProportionChanged(uint256,uint256)": EventFragment;
    "IncomeToToken(address,address,uint256,uint256)": EventFragment;
    "IncomeTokenChanged(address,address)": EventFragment;
    "Initialized(uint8)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "EmergencyWithdraw"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "IncomeProportionChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "IncomeToToken"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "IncomeTokenChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export interface EmergencyWithdrawEventObject {
  token: string;
  amount: BigNumber;
}
export type EmergencyWithdrawEvent = TypedEvent<[string, BigNumber], EmergencyWithdrawEventObject>;

export type EmergencyWithdrawEventFilter = TypedEventFilter<EmergencyWithdrawEvent>;

export interface IncomeProportionChangedEventObject {
  oldProportion: BigNumber;
  newProportion: BigNumber;
}
export type IncomeProportionChangedEvent = TypedEvent<[BigNumber, BigNumber], IncomeProportionChangedEventObject>;

export type IncomeProportionChangedEventFilter = TypedEventFilter<IncomeProportionChangedEvent>;

export interface IncomeToTokenEventObject {
  otherTokenAddress: string;
  incomeTokenAddress: string;
  amountIn: BigNumber;
  amountOut: BigNumber;
}
export type IncomeToTokenEvent = TypedEvent<[string, string, BigNumber, BigNumber], IncomeToTokenEventObject>;

export type IncomeToTokenEventFilter = TypedEventFilter<IncomeToTokenEvent>;

export interface IncomeTokenChangedEventObject {
  oldToken: string;
  newToken: string;
}
export type IncomeTokenChangedEvent = TypedEvent<[string, string], IncomeTokenChangedEventObject>;

export type IncomeTokenChangedEventFilter = TypedEventFilter<IncomeTokenChangedEvent>;

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<[string, string], OwnershipTransferredEventObject>;

export type OwnershipTransferredEventFilter = TypedEventFilter<OwnershipTransferredEvent>;

export interface IncomeMaker extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IncomeMakerInterface;

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
    PRICE_SCALE(overrides?: CallOverrides): Promise<[BigNumber]>;

    collectIncomeFromSwap(
      _tokenA: PromiseOrValue<string>,
      _tokenB: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    emergencyWithdraw(
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    factory(overrides?: CallOverrides): Promise<[string]>;

    incomeProportion(overrides?: CallOverrides): Promise<[BigNumber]>;

    incomeSharingVault(overrides?: CallOverrides): Promise<[string]>;

    incomeToken(overrides?: CallOverrides): Promise<[string]>;

    initialize(
      _incomeToken: PromiseOrValue<string>,
      _router: PromiseOrValue<string>,
      _factory: PromiseOrValue<string>,
      _vault: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<ContractTransaction>;

    router(overrides?: CallOverrides): Promise<[string]>;

    setIncomeProportion(
      _newIncomeProportion: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    setIncomeToken(
      _newIncomeToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    uint_MAX(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  PRICE_SCALE(overrides?: CallOverrides): Promise<BigNumber>;

  collectIncomeFromSwap(
    _tokenA: PromiseOrValue<string>,
    _tokenB: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  emergencyWithdraw(
    _token: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  factory(overrides?: CallOverrides): Promise<string>;

  incomeProportion(overrides?: CallOverrides): Promise<BigNumber>;

  incomeSharingVault(overrides?: CallOverrides): Promise<string>;

  incomeToken(overrides?: CallOverrides): Promise<string>;

  initialize(
    _incomeToken: PromiseOrValue<string>,
    _router: PromiseOrValue<string>,
    _factory: PromiseOrValue<string>,
    _vault: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<ContractTransaction>;

  router(overrides?: CallOverrides): Promise<string>;

  setIncomeProportion(
    _newIncomeProportion: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  setIncomeToken(
    _newIncomeToken: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  uint_MAX(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    PRICE_SCALE(overrides?: CallOverrides): Promise<BigNumber>;

    collectIncomeFromSwap(
      _tokenA: PromiseOrValue<string>,
      _tokenB: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    emergencyWithdraw(
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<void>;

    factory(overrides?: CallOverrides): Promise<string>;

    incomeProportion(overrides?: CallOverrides): Promise<BigNumber>;

    incomeSharingVault(overrides?: CallOverrides): Promise<string>;

    incomeToken(overrides?: CallOverrides): Promise<string>;

    initialize(
      _incomeToken: PromiseOrValue<string>,
      _router: PromiseOrValue<string>,
      _factory: PromiseOrValue<string>,
      _vault: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<void>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    router(overrides?: CallOverrides): Promise<string>;

    setIncomeProportion(_newIncomeProportion: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;

    setIncomeToken(_newIncomeToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;

    transferOwnership(newOwner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;

    uint_MAX(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    "EmergencyWithdraw(address,uint256)"(token?: null, amount?: null): EmergencyWithdrawEventFilter;
    EmergencyWithdraw(token?: null, amount?: null): EmergencyWithdrawEventFilter;

    "IncomeProportionChanged(uint256,uint256)"(
      oldProportion?: null,
      newProportion?: null,
    ): IncomeProportionChangedEventFilter;
    IncomeProportionChanged(oldProportion?: null, newProportion?: null): IncomeProportionChangedEventFilter;

    "IncomeToToken(address,address,uint256,uint256)"(
      otherTokenAddress?: null,
      incomeTokenAddress?: null,
      amountIn?: null,
      amountOut?: null,
    ): IncomeToTokenEventFilter;
    IncomeToToken(
      otherTokenAddress?: null,
      incomeTokenAddress?: null,
      amountIn?: null,
      amountOut?: null,
    ): IncomeToTokenEventFilter;

    "IncomeTokenChanged(address,address)"(oldToken?: null, newToken?: null): IncomeTokenChangedEventFilter;
    IncomeTokenChanged(oldToken?: null, newToken?: null): IncomeTokenChangedEventFilter;

    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null,
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null,
    ): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    PRICE_SCALE(overrides?: CallOverrides): Promise<BigNumber>;

    collectIncomeFromSwap(
      _tokenA: PromiseOrValue<string>,
      _tokenB: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    emergencyWithdraw(
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    factory(overrides?: CallOverrides): Promise<BigNumber>;

    incomeProportion(overrides?: CallOverrides): Promise<BigNumber>;

    incomeSharingVault(overrides?: CallOverrides): Promise<BigNumber>;

    incomeToken(overrides?: CallOverrides): Promise<BigNumber>;

    initialize(
      _incomeToken: PromiseOrValue<string>,
      _router: PromiseOrValue<string>,
      _factory: PromiseOrValue<string>,
      _vault: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<BigNumber>;

    router(overrides?: CallOverrides): Promise<BigNumber>;

    setIncomeProportion(
      _newIncomeProportion: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    setIncomeToken(
      _newIncomeToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    uint_MAX(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    PRICE_SCALE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    collectIncomeFromSwap(
      _tokenA: PromiseOrValue<string>,
      _tokenB: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    emergencyWithdraw(
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    factory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    incomeProportion(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    incomeSharingVault(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    incomeToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    initialize(
      _incomeToken: PromiseOrValue<string>,
      _router: PromiseOrValue<string>,
      _factory: PromiseOrValue<string>,
      _vault: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<PopulatedTransaction>;

    router(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setIncomeProportion(
      _newIncomeProportion: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    setIncomeToken(
      _newIncomeToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    uint_MAX(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
