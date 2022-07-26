/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
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

export declare namespace FarmingPool {
  export type PoolInfoStruct = {
    lpToken: PromiseOrValue<string>;
    basicFurionPerSecond: PromiseOrValue<BigNumberish>;
    lastRewardTimestamp: PromiseOrValue<BigNumberish>;
    accFurionPerShare: PromiseOrValue<BigNumberish>;
  };

  export type PoolInfoStructOutput = [
    string,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    lpToken: string;
    basicFurionPerSecond: BigNumber;
    lastRewardTimestamp: BigNumber;
    accFurionPerShare: BigNumber;
  };
}

export interface FarmingPoolInterface extends utils.Interface {
  functions: {
    "SCALE()": FunctionFragment;
    "_nextPoolId()": FunctionFragment;
    "add(address,uint256,bool)": FunctionFragment;
    "furion()": FunctionFragment;
    "getPoolList()": FunctionFragment;
    "getUserBalance(uint256,address)": FunctionFragment;
    "harvest(uint256,address)": FunctionFragment;
    "isFarming(uint256)": FunctionFragment;
    "massUpdatePools()": FunctionFragment;
    "name()": FunctionFragment;
    "owner()": FunctionFragment;
    "pause()": FunctionFragment;
    "paused()": FunctionFragment;
    "pendingFurion(uint256,address)": FunctionFragment;
    "poolList(uint256)": FunctionFragment;
    "poolMapping(address)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setFurionReward(uint256,uint256,bool)": FunctionFragment;
    "setFurionRewards(uint256[],uint256[])": FunctionFragment;
    "setStartTimestamp(uint256)": FunctionFragment;
    "stake(uint256,uint256)": FunctionFragment;
    "startTimestamp()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "unpause()": FunctionFragment;
    "updatePool(uint256)": FunctionFragment;
    "userInfo(uint256,address)": FunctionFragment;
    "withdraw(uint256,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "SCALE"
      | "_nextPoolId"
      | "add"
      | "furion"
      | "getPoolList"
      | "getUserBalance"
      | "harvest"
      | "isFarming"
      | "massUpdatePools"
      | "name"
      | "owner"
      | "pause"
      | "paused"
      | "pendingFurion"
      | "poolList"
      | "poolMapping"
      | "renounceOwnership"
      | "setFurionReward"
      | "setFurionRewards"
      | "setStartTimestamp"
      | "stake"
      | "startTimestamp"
      | "transferOwnership"
      | "unpause"
      | "updatePool"
      | "userInfo"
      | "withdraw"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "SCALE", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "_nextPoolId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "add",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<boolean>
    ]
  ): string;
  encodeFunctionData(functionFragment: "furion", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getPoolList",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getUserBalance",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "harvest",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "isFarming",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "massUpdatePools",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pendingFurion",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "poolList",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "poolMapping",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setFurionReward",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<boolean>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "setFurionRewards",
    values: [PromiseOrValue<BigNumberish>[], PromiseOrValue<BigNumberish>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "setStartTimestamp",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "stake",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "startTimestamp",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "updatePool",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "userInfo",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "SCALE", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "_nextPoolId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "add", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "furion", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPoolList",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUserBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "harvest", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "isFarming", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "massUpdatePools",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pendingFurion",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "poolList", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "poolMapping",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setFurionReward",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setFurionRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setStartTimestamp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "stake", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "startTimestamp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "updatePool", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "userInfo", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {
    "FarmingPoolStarted(uint256,uint256)": EventFragment;
    "FarmingPoolStopped(uint256,uint256)": EventFragment;
    "FurionRewardChanged(uint256,uint256)": EventFragment;
    "Harvest(address,address,uint256,uint256)": EventFragment;
    "NewPoolAdded(address,uint256)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "Paused(address)": EventFragment;
    "PoolUpdated(uint256,uint256)": EventFragment;
    "Stake(address,uint256,uint256)": EventFragment;
    "StartTimestampChanged(uint256)": EventFragment;
    "Unpaused(address)": EventFragment;
    "Withdraw(address,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "FarmingPoolStarted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FarmingPoolStopped"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FurionRewardChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Harvest"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewPoolAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Paused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PoolUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Stake"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "StartTimestampChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unpaused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Withdraw"): EventFragment;
}

export interface FarmingPoolStartedEventObject {
  poolId: BigNumber;
  timestamp: BigNumber;
}
export type FarmingPoolStartedEvent = TypedEvent<
  [BigNumber, BigNumber],
  FarmingPoolStartedEventObject
>;

export type FarmingPoolStartedEventFilter =
  TypedEventFilter<FarmingPoolStartedEvent>;

export interface FarmingPoolStoppedEventObject {
  poolId: BigNumber;
  timestamp: BigNumber;
}
export type FarmingPoolStoppedEvent = TypedEvent<
  [BigNumber, BigNumber],
  FarmingPoolStoppedEventObject
>;

export type FarmingPoolStoppedEventFilter =
  TypedEventFilter<FarmingPoolStoppedEvent>;

export interface FurionRewardChangedEventObject {
  poolId: BigNumber;
  basicFurionPerSecond: BigNumber;
}
export type FurionRewardChangedEvent = TypedEvent<
  [BigNumber, BigNumber],
  FurionRewardChangedEventObject
>;

export type FurionRewardChangedEventFilter =
  TypedEventFilter<FurionRewardChangedEvent>;

export interface HarvestEventObject {
  staker: string;
  rewardReceiver: string;
  poolId: BigNumber;
  pendingReward: BigNumber;
}
export type HarvestEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  HarvestEventObject
>;

export type HarvestEventFilter = TypedEventFilter<HarvestEvent>;

export interface NewPoolAddedEventObject {
  lpToken: string;
  basicFurionPerSecond: BigNumber;
}
export type NewPoolAddedEvent = TypedEvent<
  [string, BigNumber],
  NewPoolAddedEventObject
>;

export type NewPoolAddedEventFilter = TypedEventFilter<NewPoolAddedEvent>;

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface PausedEventObject {
  account: string;
}
export type PausedEvent = TypedEvent<[string], PausedEventObject>;

export type PausedEventFilter = TypedEventFilter<PausedEvent>;

export interface PoolUpdatedEventObject {
  poolId: BigNumber;
  accFurionPerShare: BigNumber;
}
export type PoolUpdatedEvent = TypedEvent<
  [BigNumber, BigNumber],
  PoolUpdatedEventObject
>;

export type PoolUpdatedEventFilter = TypedEventFilter<PoolUpdatedEvent>;

export interface StakeEventObject {
  staker: string;
  poolId: BigNumber;
  amount: BigNumber;
}
export type StakeEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  StakeEventObject
>;

export type StakeEventFilter = TypedEventFilter<StakeEvent>;

export interface StartTimestampChangedEventObject {
  startTimestamp: BigNumber;
}
export type StartTimestampChangedEvent = TypedEvent<
  [BigNumber],
  StartTimestampChangedEventObject
>;

export type StartTimestampChangedEventFilter =
  TypedEventFilter<StartTimestampChangedEvent>;

export interface UnpausedEventObject {
  account: string;
}
export type UnpausedEvent = TypedEvent<[string], UnpausedEventObject>;

export type UnpausedEventFilter = TypedEventFilter<UnpausedEvent>;

export interface WithdrawEventObject {
  staker: string;
  poolId: BigNumber;
  amount: BigNumber;
}
export type WithdrawEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  WithdrawEventObject
>;

export type WithdrawEventFilter = TypedEventFilter<WithdrawEvent>;

export interface FarmingPool extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: FarmingPoolInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    SCALE(overrides?: CallOverrides): Promise<[BigNumber]>;

    _nextPoolId(overrides?: CallOverrides): Promise<[BigNumber]>;

    add(
      _lpToken: PromiseOrValue<string>,
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>,
      _withUpdate: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    furion(overrides?: CallOverrides): Promise<[string]>;

    getPoolList(
      overrides?: CallOverrides
    ): Promise<[FarmingPool.PoolInfoStructOutput[]]>;

    getUserBalance(
      _poolId: PromiseOrValue<BigNumberish>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    harvest(
      _poolId: PromiseOrValue<BigNumberish>,
      _to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    isFarming(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    massUpdatePools(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    name(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    pause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    paused(overrides?: CallOverrides): Promise<[boolean]>;

    pendingFurion(
      _poolId: PromiseOrValue<BigNumberish>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    poolList(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber] & {
        lpToken: string;
        basicFurionPerSecond: BigNumber;
        lastRewardTimestamp: BigNumber;
        accFurionPerShare: BigNumber;
      }
    >;

    poolMapping(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setFurionReward(
      _poolId: PromiseOrValue<BigNumberish>,
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>,
      _withUpdate: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setFurionRewards(
      _poolId: PromiseOrValue<BigNumberish>[],
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setStartTimestamp(
      _startTimestamp: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    stake(
      _poolId: PromiseOrValue<BigNumberish>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    startTimestamp(overrides?: CallOverrides): Promise<[BigNumber]>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    unpause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    updatePool(
      _poolId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    userInfo(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        rewardDebt: BigNumber;
        stakingBalance: BigNumber;
      }
    >;

    withdraw(
      _poolId: PromiseOrValue<BigNumberish>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  SCALE(overrides?: CallOverrides): Promise<BigNumber>;

  _nextPoolId(overrides?: CallOverrides): Promise<BigNumber>;

  add(
    _lpToken: PromiseOrValue<string>,
    _basicFurionPerSecond: PromiseOrValue<BigNumberish>,
    _withUpdate: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  furion(overrides?: CallOverrides): Promise<string>;

  getPoolList(
    overrides?: CallOverrides
  ): Promise<FarmingPool.PoolInfoStructOutput[]>;

  getUserBalance(
    _poolId: PromiseOrValue<BigNumberish>,
    _user: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  harvest(
    _poolId: PromiseOrValue<BigNumberish>,
    _to: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  isFarming(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  massUpdatePools(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  name(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  pause(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  paused(overrides?: CallOverrides): Promise<boolean>;

  pendingFurion(
    _poolId: PromiseOrValue<BigNumberish>,
    _user: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  poolList(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, BigNumber, BigNumber] & {
      lpToken: string;
      basicFurionPerSecond: BigNumber;
      lastRewardTimestamp: BigNumber;
      accFurionPerShare: BigNumber;
    }
  >;

  poolMapping(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  renounceOwnership(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setFurionReward(
    _poolId: PromiseOrValue<BigNumberish>,
    _basicFurionPerSecond: PromiseOrValue<BigNumberish>,
    _withUpdate: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setFurionRewards(
    _poolId: PromiseOrValue<BigNumberish>[],
    _basicFurionPerSecond: PromiseOrValue<BigNumberish>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setStartTimestamp(
    _startTimestamp: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  stake(
    _poolId: PromiseOrValue<BigNumberish>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  startTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

  transferOwnership(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  unpause(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  updatePool(
    _poolId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  userInfo(
    arg0: PromiseOrValue<BigNumberish>,
    arg1: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & {
      rewardDebt: BigNumber;
      stakingBalance: BigNumber;
    }
  >;

  withdraw(
    _poolId: PromiseOrValue<BigNumberish>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    SCALE(overrides?: CallOverrides): Promise<BigNumber>;

    _nextPoolId(overrides?: CallOverrides): Promise<BigNumber>;

    add(
      _lpToken: PromiseOrValue<string>,
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>,
      _withUpdate: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<void>;

    furion(overrides?: CallOverrides): Promise<string>;

    getPoolList(
      overrides?: CallOverrides
    ): Promise<FarmingPool.PoolInfoStructOutput[]>;

    getUserBalance(
      _poolId: PromiseOrValue<BigNumberish>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    harvest(
      _poolId: PromiseOrValue<BigNumberish>,
      _to: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    isFarming(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    massUpdatePools(overrides?: CallOverrides): Promise<void>;

    name(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    pause(overrides?: CallOverrides): Promise<void>;

    paused(overrides?: CallOverrides): Promise<boolean>;

    pendingFurion(
      _poolId: PromiseOrValue<BigNumberish>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    poolList(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber] & {
        lpToken: string;
        basicFurionPerSecond: BigNumber;
        lastRewardTimestamp: BigNumber;
        accFurionPerShare: BigNumber;
      }
    >;

    poolMapping(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    setFurionReward(
      _poolId: PromiseOrValue<BigNumberish>,
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>,
      _withUpdate: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<void>;

    setFurionRewards(
      _poolId: PromiseOrValue<BigNumberish>[],
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>[],
      overrides?: CallOverrides
    ): Promise<void>;

    setStartTimestamp(
      _startTimestamp: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    stake(
      _poolId: PromiseOrValue<BigNumberish>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    startTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    unpause(overrides?: CallOverrides): Promise<void>;

    updatePool(
      _poolId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    userInfo(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        rewardDebt: BigNumber;
        stakingBalance: BigNumber;
      }
    >;

    withdraw(
      _poolId: PromiseOrValue<BigNumberish>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "FarmingPoolStarted(uint256,uint256)"(
      poolId?: null,
      timestamp?: null
    ): FarmingPoolStartedEventFilter;
    FarmingPoolStarted(
      poolId?: null,
      timestamp?: null
    ): FarmingPoolStartedEventFilter;

    "FarmingPoolStopped(uint256,uint256)"(
      poolId?: null,
      timestamp?: null
    ): FarmingPoolStoppedEventFilter;
    FarmingPoolStopped(
      poolId?: null,
      timestamp?: null
    ): FarmingPoolStoppedEventFilter;

    "FurionRewardChanged(uint256,uint256)"(
      poolId?: null,
      basicFurionPerSecond?: null
    ): FurionRewardChangedEventFilter;
    FurionRewardChanged(
      poolId?: null,
      basicFurionPerSecond?: null
    ): FurionRewardChangedEventFilter;

    "Harvest(address,address,uint256,uint256)"(
      staker?: null,
      rewardReceiver?: null,
      poolId?: null,
      pendingReward?: null
    ): HarvestEventFilter;
    Harvest(
      staker?: null,
      rewardReceiver?: null,
      poolId?: null,
      pendingReward?: null
    ): HarvestEventFilter;

    "NewPoolAdded(address,uint256)"(
      lpToken?: null,
      basicFurionPerSecond?: null
    ): NewPoolAddedEventFilter;
    NewPoolAdded(
      lpToken?: null,
      basicFurionPerSecond?: null
    ): NewPoolAddedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;

    "Paused(address)"(account?: null): PausedEventFilter;
    Paused(account?: null): PausedEventFilter;

    "PoolUpdated(uint256,uint256)"(
      poolId?: null,
      accFurionPerShare?: null
    ): PoolUpdatedEventFilter;
    PoolUpdated(
      poolId?: null,
      accFurionPerShare?: null
    ): PoolUpdatedEventFilter;

    "Stake(address,uint256,uint256)"(
      staker?: null,
      poolId?: null,
      amount?: null
    ): StakeEventFilter;
    Stake(staker?: null, poolId?: null, amount?: null): StakeEventFilter;

    "StartTimestampChanged(uint256)"(
      startTimestamp?: null
    ): StartTimestampChangedEventFilter;
    StartTimestampChanged(
      startTimestamp?: null
    ): StartTimestampChangedEventFilter;

    "Unpaused(address)"(account?: null): UnpausedEventFilter;
    Unpaused(account?: null): UnpausedEventFilter;

    "Withdraw(address,uint256,uint256)"(
      staker?: null,
      poolId?: null,
      amount?: null
    ): WithdrawEventFilter;
    Withdraw(staker?: null, poolId?: null, amount?: null): WithdrawEventFilter;
  };

  estimateGas: {
    SCALE(overrides?: CallOverrides): Promise<BigNumber>;

    _nextPoolId(overrides?: CallOverrides): Promise<BigNumber>;

    add(
      _lpToken: PromiseOrValue<string>,
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>,
      _withUpdate: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    furion(overrides?: CallOverrides): Promise<BigNumber>;

    getPoolList(overrides?: CallOverrides): Promise<BigNumber>;

    getUserBalance(
      _poolId: PromiseOrValue<BigNumberish>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    harvest(
      _poolId: PromiseOrValue<BigNumberish>,
      _to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    isFarming(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    massUpdatePools(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    pause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    paused(overrides?: CallOverrides): Promise<BigNumber>;

    pendingFurion(
      _poolId: PromiseOrValue<BigNumberish>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    poolList(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    poolMapping(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setFurionReward(
      _poolId: PromiseOrValue<BigNumberish>,
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>,
      _withUpdate: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setFurionRewards(
      _poolId: PromiseOrValue<BigNumberish>[],
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setStartTimestamp(
      _startTimestamp: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    stake(
      _poolId: PromiseOrValue<BigNumberish>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    startTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    unpause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    updatePool(
      _poolId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    userInfo(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(
      _poolId: PromiseOrValue<BigNumberish>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    SCALE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _nextPoolId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    add(
      _lpToken: PromiseOrValue<string>,
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>,
      _withUpdate: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    furion(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getPoolList(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getUserBalance(
      _poolId: PromiseOrValue<BigNumberish>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    harvest(
      _poolId: PromiseOrValue<BigNumberish>,
      _to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    isFarming(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    massUpdatePools(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    paused(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pendingFurion(
      _poolId: PromiseOrValue<BigNumberish>,
      _user: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    poolList(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    poolMapping(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setFurionReward(
      _poolId: PromiseOrValue<BigNumberish>,
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>,
      _withUpdate: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setFurionRewards(
      _poolId: PromiseOrValue<BigNumberish>[],
      _basicFurionPerSecond: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setStartTimestamp(
      _startTimestamp: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    stake(
      _poolId: PromiseOrValue<BigNumberish>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    startTimestamp(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    unpause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    updatePool(
      _poolId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    userInfo(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdraw(
      _poolId: PromiseOrValue<BigNumberish>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
