/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { FunctionFragment, Result } from "@ethersproject/abi";
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

import type { OnEvent, PromiseOrValue, TypedEvent, TypedEventFilter, TypedListener } from "../../../common";

export interface IVeFURInterface extends utils.Interface {
  functions: {
    "balanceOf(address)": FunctionFragment;
    "claim()": FunctionFragment;
    "deposit(uint256)": FunctionFragment;
    "getStakedFur(address)": FunctionFragment;
    "getVotes(address)": FunctionFragment;
    "isUser(address)": FunctionFragment;
    "lockVeFUR(address,uint256)": FunctionFragment;
    "totalSupply()": FunctionFragment;
    "unlockVeFUR(address,uint256)": FunctionFragment;
    "withdraw(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "balanceOf"
      | "claim"
      | "deposit"
      | "getStakedFur"
      | "getVotes"
      | "isUser"
      | "lockVeFUR"
      | "totalSupply"
      | "unlockVeFUR"
      | "withdraw",
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "balanceOf", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "claim", values?: undefined): string;
  encodeFunctionData(functionFragment: "deposit", values: [PromiseOrValue<BigNumberish>]): string;
  encodeFunctionData(functionFragment: "getStakedFur", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "getVotes", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "isUser", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(
    functionFragment: "lockVeFUR",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(functionFragment: "totalSupply", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "unlockVeFUR",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(functionFragment: "withdraw", values: [PromiseOrValue<BigNumberish>]): string;

  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "claim", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getStakedFur", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getVotes", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "isUser", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "lockVeFUR", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "totalSupply", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "unlockVeFUR", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {};
}

export interface IVeFUR extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IVeFURInterface;

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
    balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;

    claim(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<ContractTransaction>;

    deposit(
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    getStakedFur(_addr: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;

    getVotes(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;

    isUser(_addr: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;

    lockVeFUR(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    unlockVeFUR(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    withdraw(
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;
  };

  balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

  claim(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<ContractTransaction>;

  deposit(
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  getStakedFur(_addr: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

  getVotes(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

  isUser(_addr: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;

  lockVeFUR(
    _to: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  unlockVeFUR(
    _to: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  withdraw(
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  callStatic: {
    balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    claim(overrides?: CallOverrides): Promise<void>;

    deposit(_amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;

    getStakedFur(_addr: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    getVotes(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    isUser(_addr: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;

    lockVeFUR(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<void>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    unlockVeFUR(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<void>;

    withdraw(_amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
  };

  filters: {};

  estimateGas: {
    balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    claim(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<BigNumber>;

    deposit(
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    getStakedFur(_addr: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    getVotes(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    isUser(_addr: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    lockVeFUR(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    unlockVeFUR(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    withdraw(
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    claim(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<PopulatedTransaction>;

    deposit(
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    getStakedFur(_addr: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getVotes(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isUser(_addr: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    lockVeFUR(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    unlockVeFUR(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    withdraw(
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;
  };
}
