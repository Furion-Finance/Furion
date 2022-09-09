/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";

import type { OnEvent, PromiseOrValue, TypedEvent, TypedEventFilter, TypedListener } from "../common";

export interface TestClaimInterface extends utils.Interface {
  functions: {
    "claimAlready(address)": FunctionFragment;
    "claimTest()": FunctionFragment;
    "coolCats()": FunctionFragment;
    "furion()": FunctionFragment;
    "usd()": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "claimAlready" | "claimTest" | "coolCats" | "furion" | "usd"): FunctionFragment;

  encodeFunctionData(functionFragment: "claimAlready", values: [PromiseOrValue<string>]): string;
  encodeFunctionData(functionFragment: "claimTest", values?: undefined): string;
  encodeFunctionData(functionFragment: "coolCats", values?: undefined): string;
  encodeFunctionData(functionFragment: "furion", values?: undefined): string;
  encodeFunctionData(functionFragment: "usd", values?: undefined): string;

  decodeFunctionResult(functionFragment: "claimAlready", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "claimTest", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "coolCats", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "furion", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "usd", data: BytesLike): Result;

  events: {};
}

export interface TestClaim extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: TestClaimInterface;

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
    claimAlready(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;

    claimTest(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<ContractTransaction>;

    coolCats(overrides?: CallOverrides): Promise<[string]>;

    furion(overrides?: CallOverrides): Promise<[string]>;

    usd(overrides?: CallOverrides): Promise<[string]>;
  };

  claimAlready(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;

  claimTest(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<ContractTransaction>;

  coolCats(overrides?: CallOverrides): Promise<string>;

  furion(overrides?: CallOverrides): Promise<string>;

  usd(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    claimAlready(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;

    claimTest(overrides?: CallOverrides): Promise<void>;

    coolCats(overrides?: CallOverrides): Promise<string>;

    furion(overrides?: CallOverrides): Promise<string>;

    usd(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    claimAlready(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;

    claimTest(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<BigNumber>;

    coolCats(overrides?: CallOverrides): Promise<BigNumber>;

    furion(overrides?: CallOverrides): Promise<BigNumber>;

    usd(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    claimAlready(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    claimTest(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<PopulatedTransaction>;

    coolCats(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    furion(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    usd(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
