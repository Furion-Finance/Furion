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

export interface AggregatePoolInterface extends utils.Interface {
  functions: {
    "DOMAIN_SEPARATOR()": FunctionFragment;
    "allowance(address,address)": FunctionFragment;
    "approve(address,uint256)": FunctionFragment;
    "balanceOf(address)": FunctionFragment;
    "changeOwner(address)": FunctionFragment;
    "circulatingSupply()": FunctionFragment;
    "decimals()": FunctionFragment;
    "decreaseAllowance(address,uint256)": FunctionFragment;
    "factory()": FunctionFragment;
    "increaseAllowance(address,uint256)": FunctionFragment;
    "name()": FunctionFragment;
    "nonces(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "permit(address,address,uint256,uint256,uint8,bytes32,bytes32)": FunctionFragment;
    "registerToken(address)": FunctionFragment;
    "registered(address)": FunctionFragment;
    "setStakeFee(uint256)": FunctionFragment;
    "setUnstakeFee(uint256)": FunctionFragment;
    "stake(address,uint256)": FunctionFragment;
    "stakeFee()": FunctionFragment;
    "symbol()": FunctionFragment;
    "tokenTypes()": FunctionFragment;
    "totalSupply()": FunctionFragment;
    "transfer(address,uint256)": FunctionFragment;
    "transferFrom(address,address,uint256)": FunctionFragment;
    "unstake(address,uint256)": FunctionFragment;
    "unstakeFee()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "DOMAIN_SEPARATOR"
      | "allowance"
      | "approve"
      | "balanceOf"
      | "changeOwner"
      | "circulatingSupply"
      | "decimals"
      | "decreaseAllowance"
      | "factory"
      | "increaseAllowance"
      | "name"
      | "nonces"
      | "owner"
      | "permit"
      | "registerToken"
      | "registered"
      | "setStakeFee"
      | "setUnstakeFee"
      | "stake"
      | "stakeFee"
      | "symbol"
      | "tokenTypes"
      | "totalSupply"
      | "transfer"
      | "transferFrom"
      | "unstake"
      | "unstakeFee",
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "DOMAIN_SEPARATOR", values?: undefined): string;
  encodeFunctionData(functionFragment: "allowance", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(functionFragment: "balanceOf", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "changeOwner", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "circulatingSupply", values?: undefined): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "decreaseAllowance",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(functionFragment: "factory", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "increaseAllowance",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(functionFragment: "nonces", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "permit",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>,
    ],
  ): string;
  encodeFunctionData(functionFragment: "registerToken", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "registered", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "setStakeFee", values: [PromiseOrValue<BigNumberish>]): string;
  encodeFunctionData(functionFragment: "setUnstakeFee", values: [PromiseOrValue<BigNumberish>]): string;
  encodeFunctionData(functionFragment: "stake", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
  encodeFunctionData(functionFragment: "stakeFee", values?: undefined): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(functionFragment: "tokenTypes", values?: undefined): string;
  encodeFunctionData(functionFragment: "totalSupply", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [PromiseOrValue<string>, PromiseOrValue<string>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(
    functionFragment: "unstake",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(functionFragment: "unstakeFee", values?: undefined): string;

  decodeFunctionResult(functionFragment: "DOMAIN_SEPARATOR", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "changeOwner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "circulatingSupply", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "decreaseAllowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "factory", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "increaseAllowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "nonces", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "permit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "registerToken", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "registered", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setStakeFee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setUnstakeFee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "stake", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "stakeFee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tokenTypes", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "totalSupply", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "transferFrom", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "unstake", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "unstakeFee", data: BytesLike): Result;

  events: {
    "Approval(address,address,uint256)": EventFragment;
    "RegisteredToken(address)": EventFragment;
    "StakedToken(address,address,uint256)": EventFragment;
    "Transfer(address,address,uint256)": EventFragment;
    "UnstakedToken(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Approval"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RegisteredToken"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "StakedToken"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UnstakedToken"): EventFragment;
}

export interface ApprovalEventObject {
  owner: string;
  spender: string;
  value: BigNumber;
}
export type ApprovalEvent = TypedEvent<[string, string, BigNumber], ApprovalEventObject>;

export type ApprovalEventFilter = TypedEventFilter<ApprovalEvent>;

export interface RegisteredTokenEventObject {
  tokenAddress: string;
}
export type RegisteredTokenEvent = TypedEvent<[string], RegisteredTokenEventObject>;

export type RegisteredTokenEventFilter = TypedEventFilter<RegisteredTokenEvent>;

export interface StakedTokenEventObject {
  tokenAddress: string;
  staker: string;
  tokenAmount: BigNumber;
}
export type StakedTokenEvent = TypedEvent<[string, string, BigNumber], StakedTokenEventObject>;

export type StakedTokenEventFilter = TypedEventFilter<StakedTokenEvent>;

export interface TransferEventObject {
  from: string;
  to: string;
  value: BigNumber;
}
export type TransferEvent = TypedEvent<[string, string, BigNumber], TransferEventObject>;

export type TransferEventFilter = TypedEventFilter<TransferEvent>;

export interface UnstakedTokenEventObject {
  tokenAddress: string;
  unstaker: string;
  tokenAmount: BigNumber;
}
export type UnstakedTokenEvent = TypedEvent<[string, string, BigNumber], UnstakedTokenEventObject>;

export type UnstakedTokenEventFilter = TypedEventFilter<UnstakedTokenEvent>;

export interface AggregatePool extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AggregatePoolInterface;

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
    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<[string]>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<[BigNumber]>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;

    changeOwner(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    circulatingSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    decimals(overrides?: CallOverrides): Promise<[number]>;

    decreaseAllowance(
      spender: PromiseOrValue<string>,
      subtractedValue: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    factory(overrides?: CallOverrides): Promise<[string]>;

    increaseAllowance(
      spender: PromiseOrValue<string>,
      addedValue: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    name(overrides?: CallOverrides): Promise<[string]>;

    nonces(owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    permit(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    registerToken(
      _tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    registered(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;

    setStakeFee(
      _newStakeFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    setUnstakeFee(
      _newUnstakeFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    stake(
      _tokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    stakeFee(overrides?: CallOverrides): Promise<[BigNumber]>;

    symbol(overrides?: CallOverrides): Promise<[string]>;

    tokenTypes(overrides?: CallOverrides): Promise<[BigNumber]>;

    totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    unstake(
      _tokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    unstakeFee(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<string>;

  allowance(
    owner: PromiseOrValue<string>,
    spender: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<BigNumber>;

  approve(
    spender: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

  changeOwner(
    _newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  circulatingSupply(overrides?: CallOverrides): Promise<BigNumber>;

  decimals(overrides?: CallOverrides): Promise<number>;

  decreaseAllowance(
    spender: PromiseOrValue<string>,
    subtractedValue: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  factory(overrides?: CallOverrides): Promise<string>;

  increaseAllowance(
    spender: PromiseOrValue<string>,
    addedValue: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  name(overrides?: CallOverrides): Promise<string>;

  nonces(owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  permit(
    owner: PromiseOrValue<string>,
    spender: PromiseOrValue<string>,
    value: PromiseOrValue<BigNumberish>,
    deadline: PromiseOrValue<BigNumberish>,
    v: PromiseOrValue<BigNumberish>,
    r: PromiseOrValue<BytesLike>,
    s: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  registerToken(
    _tokenAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  registered(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;

  setStakeFee(
    _newStakeFee: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  setUnstakeFee(
    _newUnstakeFee: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  stake(
    _tokenAddress: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  stakeFee(overrides?: CallOverrides): Promise<BigNumber>;

  symbol(overrides?: CallOverrides): Promise<string>;

  tokenTypes(overrides?: CallOverrides): Promise<BigNumber>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  transfer(
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  transferFrom(
    from: PromiseOrValue<string>,
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  unstake(
    _tokenAddress: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  unstakeFee(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<string>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<boolean>;

    balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    changeOwner(_newOwner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;

    circulatingSupply(overrides?: CallOverrides): Promise<BigNumber>;

    decimals(overrides?: CallOverrides): Promise<number>;

    decreaseAllowance(
      spender: PromiseOrValue<string>,
      subtractedValue: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<boolean>;

    factory(overrides?: CallOverrides): Promise<string>;

    increaseAllowance(
      spender: PromiseOrValue<string>,
      addedValue: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<boolean>;

    name(overrides?: CallOverrides): Promise<string>;

    nonces(owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    permit(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides,
    ): Promise<void>;

    registerToken(_tokenAddress: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;

    registered(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;

    setStakeFee(_newStakeFee: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;

    setUnstakeFee(_newUnstakeFee: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;

    stake(
      _tokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<void>;

    stakeFee(overrides?: CallOverrides): Promise<BigNumber>;

    symbol(overrides?: CallOverrides): Promise<string>;

    tokenTypes(overrides?: CallOverrides): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<boolean>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<boolean>;

    unstake(
      _tokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<void>;

    unstakeFee(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    "Approval(address,address,uint256)"(
      owner?: PromiseOrValue<string> | null,
      spender?: PromiseOrValue<string> | null,
      value?: null,
    ): ApprovalEventFilter;
    Approval(
      owner?: PromiseOrValue<string> | null,
      spender?: PromiseOrValue<string> | null,
      value?: null,
    ): ApprovalEventFilter;

    "RegisteredToken(address)"(tokenAddress?: null): RegisteredTokenEventFilter;
    RegisteredToken(tokenAddress?: null): RegisteredTokenEventFilter;

    "StakedToken(address,address,uint256)"(
      tokenAddress?: PromiseOrValue<string> | null,
      staker?: PromiseOrValue<string> | null,
      tokenAmount?: null,
    ): StakedTokenEventFilter;
    StakedToken(
      tokenAddress?: PromiseOrValue<string> | null,
      staker?: PromiseOrValue<string> | null,
      tokenAmount?: null,
    ): StakedTokenEventFilter;

    "Transfer(address,address,uint256)"(
      from?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null,
      value?: null,
    ): TransferEventFilter;
    Transfer(
      from?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null,
      value?: null,
    ): TransferEventFilter;

    "UnstakedToken(address,address,uint256)"(
      tokenAddress?: PromiseOrValue<string> | null,
      unstaker?: PromiseOrValue<string> | null,
      tokenAmount?: null,
    ): UnstakedTokenEventFilter;
    UnstakedToken(
      tokenAddress?: PromiseOrValue<string> | null,
      unstaker?: PromiseOrValue<string> | null,
      tokenAmount?: null,
    ): UnstakedTokenEventFilter;
  };

  estimateGas: {
    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<BigNumber>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    changeOwner(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    circulatingSupply(overrides?: CallOverrides): Promise<BigNumber>;

    decimals(overrides?: CallOverrides): Promise<BigNumber>;

    decreaseAllowance(
      spender: PromiseOrValue<string>,
      subtractedValue: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    factory(overrides?: CallOverrides): Promise<BigNumber>;

    increaseAllowance(
      spender: PromiseOrValue<string>,
      addedValue: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<BigNumber>;

    nonces(owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    permit(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    registerToken(
      _tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    registered(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    setStakeFee(
      _newStakeFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    setUnstakeFee(
      _newUnstakeFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    stake(
      _tokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    stakeFee(overrides?: CallOverrides): Promise<BigNumber>;

    symbol(overrides?: CallOverrides): Promise<BigNumber>;

    tokenTypes(overrides?: CallOverrides): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    unstake(
      _tokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    unstakeFee(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    changeOwner(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    circulatingSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    decreaseAllowance(
      spender: PromiseOrValue<string>,
      subtractedValue: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    factory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    increaseAllowance(
      spender: PromiseOrValue<string>,
      addedValue: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nonces(owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    permit(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    registerToken(
      _tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    registered(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setStakeFee(
      _newStakeFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    setUnstakeFee(
      _newUnstakeFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    stake(
      _tokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    stakeFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokenTypes(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    unstake(
      _tokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    unstakeFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}