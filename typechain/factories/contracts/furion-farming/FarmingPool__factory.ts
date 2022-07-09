/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { PromiseOrValue } from "../../../common";
import type {
  FarmingPool,
  FarmingPoolInterface,
} from "../../../contracts/furion-farming/FarmingPool";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_furion",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FarmingPoolStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FarmingPoolStopped",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "basicFurionPerSecond",
        type: "uint256",
      },
    ],
    name: "FurionRewardChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "rewardReceiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "pendingReward",
        type: "uint256",
      },
    ],
    name: "Harvest",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "lpToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "basicFurionPerSecond",
        type: "uint256",
      },
    ],
    name: "NewPoolAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "accFurionPerShare",
        type: "uint256",
      },
    ],
    name: "PoolUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Stake",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "startTimestamp",
        type: "uint256",
      },
    ],
    name: "StartTimestampChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "SCALE",
    outputs: [
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
    inputs: [],
    name: "_nextPoolId",
    outputs: [
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
        name: "_lpToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_basicFurionPerSecond",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_withUpdate",
        type: "bool",
      },
    ],
    name: "add",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "furion",
    outputs: [
      {
        internalType: "contract IFurionToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolList",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "lpToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "basicFurionPerSecond",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastRewardTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "accFurionPerShare",
            type: "uint256",
          },
        ],
        internalType: "struct FarmingPool.PoolInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_poolId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getUserBalance",
    outputs: [
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
        internalType: "uint256",
        name: "_poolId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
    ],
    name: "harvest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "isFarming",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "massUpdatePools",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
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
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_poolId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "pendingFurion",
    outputs: [
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "poolList",
    outputs: [
      {
        internalType: "address",
        name: "lpToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "basicFurionPerSecond",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastRewardTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "accFurionPerShare",
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
        name: "",
        type: "address",
      },
    ],
    name: "poolMapping",
    outputs: [
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
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_poolId",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "_basicFurionPerSecond",
        type: "uint256[]",
      },
      {
        internalType: "bool",
        name: "_withUpdate",
        type: "bool",
      },
    ],
    name: "setFurionReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_poolId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_basicFurionPerSecond",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_withUpdate",
        type: "bool",
      },
    ],
    name: "setFurionReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_startTimestamp",
        type: "uint256",
      },
    ],
    name: "setStartTimestamp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_poolId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startTimestamp",
    outputs: [
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
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_poolId",
        type: "uint256",
      },
    ],
    name: "updatePool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "rewardDebt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "stakingBalance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_poolId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162002712380380620027128339810160408190526200003491620001a1565b33620000408162000151565b506001808055600280546001600160a81b0319166101006001600160a01b03948516021790556003819055604080516080810182526000808252602082018181529282018181526060830182815260058054968701815590925291517f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db0600490950294850180546001600160a01b031916919096161790945590517f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db1830155517f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db282015590517f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db390910155620001d3565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b600060208284031215620001b457600080fd5b81516001600160a01b0381168114620001cc57600080fd5b9392505050565b61252f80620001e36000396000f3fe608060405234801561001057600080fd5b50600436106101b95760003560e01c80637b0472f0116100f9578063c24c016e11610097578063d41dcbea11610071578063d41dcbea14610448578063e6fd48bc1461045d578063eced552614610466578063f2fde38b1461047257600080fd5b8063c24c016e146103e9578063c44bef75146103fc578063cdfb6cf31461040f57600080fd5b8063909ff828116100d3578063909ff8281461035457806393f1a40b1461036c578063a06ddcb3146103b3578063bcedbe2b146103d657600080fd5b80637b0472f0146103145780638456cb59146103275780638da5cb5b1461032f57600080fd5b80633f4ba83a116101665780635c158023116101405780635c158023146102da5780635c975abb146102ed578063630b5ba114610304578063715018a61461030c57600080fd5b80633f4ba83a146102ac578063441a3e70146102b457806351eb05a6146102c757600080fd5b806318fccc761161019757806318fccc761461023c5780632a48235b1461024f5780632c678a3e1461028c57600080fd5b806306fdde03146101be5780630dec23121461021057806317fb77de14610225575b600080fd5b6101fa6040518060400160405280601681526020017f467572696f6e204c50204661726d696e6720506f6f6c0000000000000000000081525081565b6040516102079190612191565b60405180910390f35b61022361021e3660046121ee565b610485565b005b61022e60035481565b604051908152602001610207565b61022361024a36600461222e565b610759565b61026261025d36600461225a565b61095e565b604080516001600160a01b0390951685526020850193909352918301526060820152608001610207565b61022e61029a366004612273565b60066020526000908152604090205481565b6102236109a2565b6102236102c236600461228e565b610a15565b6102236102d536600461225a565b610cd3565b6102236102e83660046122fc565b610e8c565b60025460ff165b6040519015158152602001610207565b610223610fa6565b610223610fea565b61022361032236600461228e565b61105d565b6102236112e6565b6000546001600160a01b03165b6040516001600160a01b039091168152602001610207565b60025461033c9061010090046001600160a01b031681565b61039e61037a36600461222e565b60086020908152600092835260408084209091529082529020805460019091015482565b60408051928352602083019190915201610207565b6102f46103c136600461225a565b60076020526000908152604090205460ff1681565b61022e6103e436600461222e565b611357565b6102236103f7366004612380565b61154f565b61022361040a36600461225a565b61179f565b61022e61041d36600461222e565b60009182526008602090815260408084206001600160a01b0393909316845291905290206001015490565b61045061189d565b60405161020791906123ae565b61022e60045481565b61022e64e8d4a5100081565b610223610480366004612273565b611927565b826001600160a01b0381166104e15760405162461bcd60e51b815260206004820152601a60248201527f4641524d494e475f504f4f4c3a205a45524f5f4144445245535300000000000060448201526064015b60405180910390fd5b336104f46000546001600160a01b031690565b6001600160a01b03161461054a5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104d8565b610552611a18565b61055b84611a6b565b156105a85760405162461bcd60e51b815260206004820152601d60248201527f4641524d494e475f504f4f4c3a20414c52454144595f494e5f504f4f4c00000060448201526064016104d8565b81156105b6576105b6610fa6565b600060045442116105c9576004546105cb565b425b604080516080810182526001600160a01b0388811682526020820188815292820184815260006060840181815260058054600181018255925293517f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db06004909202918201805473ffffffffffffffffffffffffffffffffffffffff1916919094161790925592517f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db182015591517f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db2830155517f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db390910155905083156106e7576003546000908152600760205260409020805460ff191660011790555b600380549060006106f783612431565b909155506001600160a01b0386166000818152600660209081526040918290209390935580519182529181018690527f38bff197ec9fef6e32271789b78dca0f10af5b2b546ce690a67899f608ba4f4c91015b60405180910390a15050505050565b6002600154036107ab5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016104d8565b60026001556107b8611a18565b60008281526007602052604090205460ff16156107d8576107d882610cd3565b6000600583815481106107ed576107ed61244a565b6000918252602080832060408051608081018252600490940290910180546001600160a01b031684526001808201548585015260028201548584015260039091015460608501908152888652600884528286203387529093529084208054925191810154939550939264e8d4a510009161086691612460565b610870919061247f565b61087a91906124a1565b9050600081116108cc5760405162461bcd60e51b815260206004820152601f60248201527f4641524d494e475f504f4f4c3a204e4f5f50454e44494e475f5245574152440060448201526064016104d8565b64e8d4a51000836060015183600101546108e69190612460565b6108f0919061247f565b825560006108fe8583611a9c565b604080513381526001600160a01b0388166020820152908101889052606081018290529091507fdec9257d126f56798a34ce7ca0ffedeaa9a024543946f79c3b5038035ba32a1e906080015b60405180910390a150506001805550505050565b6005818154811061096e57600080fd5b600091825260209091206004909102018054600182015460028301546003909301546001600160a01b039092169350919084565b336109b56000546001600160a01b031690565b6001600160a01b031614610a0b5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104d8565b610a13611bb3565b565b600260015403610a675760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016104d8565b6002600155610a74611a18565b60008111610ac45760405162461bcd60e51b815260206004820152601b60248201527f4641524d494e475f504f4f4c3a2057495448445241575f5a45524f000000000060448201526064016104d8565b600060058381548110610ad957610ad961244a565b600091825260208083208684526008825260408085203386529092529220600181015460049092029092019250831115610b7b5760405162461bcd60e51b815260206004820152602760248201527f4641524d494e475f504f4f4c3a204e4f5f454e4f5547485f5354414b494e475f60448201527f42414c414e43450000000000000000000000000000000000000000000000000060648201526084016104d8565b60008481526007602052604090205460ff1615610b9b57610b9b84610cd3565b6000816000015464e8d4a5100084600301548460010154610bbc9190612460565b610bc6919061247f565b610bd091906124a1565b90506000610bde3383611a9c565b60408051338082526020820152908101889052606081018290529091507fdec9257d126f56798a34ce7ca0ffedeaa9a024543946f79c3b5038035ba32a1e9060800160405180910390a18354600090610c44906001906001600160a01b03163389611c05565b905080846001016000828254610c5a91906124a1565b90915550506003850154600185015464e8d4a5100091610c7991612460565b610c83919061247f565b845560408051338152602081018990529081018290527ff279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b5689060600160405180910390a15050600180555050505050565b600060058281548110610ce857610ce861244a565b9060005260206000209060040201905080600201544211610d07575050565b80546040516370a0823160e01b81523060048201526000916001600160a01b0316906370a0823190602401602060405180830381865afa158015610d4f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d7391906124b8565b905080600003610d8857504260029091015550565b6000826002015442610d9a91906124a1565b90506000836001015482610dae9190612460565b905082610dc064e8d4a5100083612460565b610dca919061247f565b846003016000828254610ddd91906124d1565b9091555050600254604051632b2cea1960e21b8152306004820152602481018390526101009091046001600160a01b03169063acb3a86490604401600060405180830381600087803b158015610e3257600080fd5b505af1158015610e46573d6000803e3d6000fd5b5050426002870155505060038401546040805187815260208101929092527f7fa9647ec1cc14e3822b46d05a2b9d4e019bde8875c0088c46b6503d71bf1722910161074a565b33610e9f6000546001600160a01b031690565b6001600160a01b031614610ef55760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104d8565b610efd611a18565b836009811115610f4f5760405162461bcd60e51b815260206004820152601c60248201527f4641524d494e475f504f4f4c3a204d4f52455f5448414e5f4e494e450000000060448201526064016104d8565b60005b81811015610f9d57610f95878783818110610f6f57610f6f61244a565b90506020020135868684818110610f8857610f8861244a565b905060200201358561154f565b600101610f52565b50505050505050565b60055460005b81811015610fe65760008181526007602052604090205460ff1615610fd457610fd481610cd3565b80610fde81612431565b915050610fac565b5050565b33610ffd6000546001600160a01b031690565b6001600160a01b0316146110535760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104d8565b610a136000611d3e565b6002600154036110af5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016104d8565b60026001556110bc611a18565b600082815260076020526040902054829060ff1661111c5760405162461bcd60e51b815260206004820152601e60248201527f4641524d494e475f504f4f4c3a20504f4f4c5f4e4f545f4641524d494e47000060448201526064016104d8565b6000821161116c5760405162461bcd60e51b815260206004820152601860248201527f4641524d494e475f504f4f4c3a205354414b455f5a45524f000000000000000060448201526064016104d8565b6000600584815481106111815761118161244a565b600091825260208083208784526008825260408085203386529092529220600490910290910191506111b285610cd3565b60018101541561124c576000816000015464e8d4a51000846003015484600101546111dd9190612460565b6111e7919061247f565b6111f191906124a1565b905060006111ff3383611a9c565b60408051338082526020820152908101899052606081018290529091507fdec9257d126f56798a34ce7ca0ffedeaa9a024543946f79c3b5038035ba32a1e9060800160405180910390a150505b81546000906112679082906001600160a01b03163388611c05565b90508082600101600082825461127d91906124d1565b90915550506003830154600183015464e8d4a510009161129c91612460565b6112a6919061247f565b825560408051338152602081018890529081018290527f5af417134f72a9d41143ace85b0a26dce6f550f894f2cbc1eeee8810603d91b69060600161094a565b336112f96000546001600160a01b031690565b6001600160a01b03161461134f5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104d8565b610a13611d9b565b6000806005848154811061136d5761136d61244a565b600091825260209182902060408051608081018252600490930290910180546001600160a01b0316835260018101549383019390935260028301549082018190526003909201546060820152915015806113ca5750806040015142105b806113d6575060045442105b156113e5576000915050611549565b60008481526008602090815260408083206001600160a01b038781168552908352818420825180840184528154815260019091015493810193909352845191516370a0823160e01b81523060048201529293929116906370a0823190602401602060405180830381865afa158015611461573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061148591906124b8565b606084015190915060008290036114a3576000945050505050611549565b60008781526007602052604090205460ff161561150b5760008460400151426114cc91906124a1565b905060008186602001516114e09190612460565b9050836114f264e8d4a5100083612460565b6114fc919061247f565b61150690846124d1565b925050505b6000836000015164e8d4a510008386602001516115289190612460565b611532919061247f565b61153c91906124a1565b9550611549945050505050565b92915050565b336115626000546001600160a01b031690565b6001600160a01b0316146115b85760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104d8565b6115c0611a18565b600583815481106115d3576115d361244a565b9060005260206000209060040201600201546000036116345760405162461bcd60e51b815260206004820152601c60248201527f4641524d494e475f504f4f4c3a20504f4f4c5f4e4f545f45584953540000000060448201526064016104d8565b801561164757611642610fa6565b611650565b61165083610cd3565b60008381526007602052604090205460ff1615801561166f5750600082115b156116d15760008381526007602052604090819020805460ff19166001179055517f6140f1d5adcbca6c6b24c3b5e695335cd1a2071c7e03881172dc9eb0e488225c906116c89085904290918252602082015260400190565b60405180910390a15b816000036117375760008381526007602052604090819020805460ff19169055517f4654f9b7bb3ba4d66e3a4e972e39db189ac7b4fdf5f2a95d57a4eb4d91a16d459061172a9085904290918252602082015260400190565b60405180910390a1505050565b816005848154811061174b5761174b61244a565b9060005260206000209060040201600101819055507f0226e7c985ca3cd56b9373c9d63f632fc54d30a22623f59774a07db772041467838360405161172a929190918252602082015260400190565b505050565b336117b26000546001600160a01b031690565b6001600160a01b0316146118085760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104d8565b611810611a18565b6003546001146118625760405162461bcd60e51b815260206004820152601460248201527f414c52454144595f484156494e475f504f4f4c5300000000000000000000000060448201526064016104d8565b60048190556040518181527faf8fc8a4c9a55a9a29c3e99cd1797d43062c696f192896c79cbebd7da3286d829060200160405180910390a150565b60606005805480602002602001604051908101604052809291908181526020016000905b8282101561191e576000848152602090819020604080516080810182526004860290920180546001600160a01b031683526001808201548486015260028201549284019290925260030154606083015290835290920191016118c1565b50505050905090565b3361193a6000546001600160a01b031690565b6001600160a01b0316146119905760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104d8565b6001600160a01b038116611a0c5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f646472657373000000000000000000000000000000000000000000000000000060648201526084016104d8565b611a1581611d3e565b50565b60025460ff1615610a135760405162461bcd60e51b815260206004820152601060248201527f5061757361626c653a207061757365640000000000000000000000000000000060448201526064016104d8565b6001600160a01b038116600090815260066020526040812054808203611a92576000611a95565b60015b9392505050565b6002546040516370a0823160e01b815230600482015260009182916101009091046001600160a01b0316906370a0823190602401602060405180830381865afa158015611aed573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b1191906124b8565b905060008111611b635760405162461bcd60e51b815260206004820152601c60248201527f4641524d494e475f504f4f4c3a204e4f5f4655525f494e5f504f4f4c0000000060448201526064016104d8565b80831115611b8e57600254611b879061010090046001600160a01b03168583611dd8565b9050611549565b600254611baa9061010090046001600160a01b03168585611dd8565b82915050611549565b611bbb611e68565b6002805460ff191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b6040516001600160a01b03909116815260200160405180910390a1565b6040516370a0823160e01b815230600482015260009081906001600160a01b038616906370a0823190602401602060405180830381865afa158015611c4e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611c7291906124b8565b90508515611c9357611c8e6001600160a01b0386168585611dd8565b611ca8565b611ca86001600160a01b038616853086611eba565b6040516370a0823160e01b81523060048201526000906001600160a01b038716906370a0823190602401602060405180830381865afa158015611cef573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d1391906124b8565b905086611d2957611d2482826124a1565b611d33565b611d3381836124a1565b979650505050505050565b600080546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b611da3611a18565b6002805460ff191660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258611be83390565b6040516001600160a01b03831660248201526044810182905261179a90849063a9059cbb60e01b906064015b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff0000000000000000000000000000000000000000000000000000000090931692909217909152611ef8565b60025460ff16610a135760405162461bcd60e51b815260206004820152601460248201527f5061757361626c653a206e6f742070617573656400000000000000000000000060448201526064016104d8565b6040516001600160a01b0380851660248301528316604482015260648101829052611ef29085906323b872dd60e01b90608401611e04565b50505050565b6000611f4d826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b0316611fdd9092919063ffffffff16565b80519091501561179a5780806020019051810190611f6b91906124e9565b61179a5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f7420737563636565640000000000000000000000000000000000000000000060648201526084016104d8565b6060611fec8484600085611ff4565b949350505050565b60608247101561206c5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c000000000000000000000000000000000000000000000000000060648201526084016104d8565b6001600160a01b0385163b6120c35760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064016104d8565b600080866001600160a01b031685876040516120df9190612506565b60006040518083038185875af1925050503d806000811461211c576040519150601f19603f3d011682016040523d82523d6000602084013e612121565b606091505b5091509150611d338282866060831561213b575081611a95565b82511561214b5782518084602001fd5b8160405162461bcd60e51b81526004016104d89190612191565b60005b83811015612180578181015183820152602001612168565b83811115611ef25750506000910152565b60208152600082518060208401526121b0816040850160208701612165565b601f01601f19169190910160400192915050565b80356001600160a01b03811681146121db57600080fd5b919050565b8015158114611a1557600080fd5b60008060006060848603121561220357600080fd5b61220c846121c4565b9250602084013591506040840135612223816121e0565b809150509250925092565b6000806040838503121561224157600080fd5b82359150612251602084016121c4565b90509250929050565b60006020828403121561226c57600080fd5b5035919050565b60006020828403121561228557600080fd5b611a95826121c4565b600080604083850312156122a157600080fd5b50508035926020909101359150565b60008083601f8401126122c257600080fd5b50813567ffffffffffffffff8111156122da57600080fd5b6020830191508360208260051b85010111156122f557600080fd5b9250929050565b60008060008060006060868803121561231457600080fd5b853567ffffffffffffffff8082111561232c57600080fd5b61233889838a016122b0565b9097509550602088013591508082111561235157600080fd5b5061235e888289016122b0565b9094509250506040860135612372816121e0565b809150509295509295909350565b60008060006060848603121561239557600080fd5b83359250602084013591506040840135612223816121e0565b602080825282518282018190526000919060409081850190868401855b8281101561240e57815180516001600160a01b031685528681015187860152858101518686015260609081015190850152608090930192908501906001016123cb565b5091979650505050505050565b634e487b7160e01b600052601160045260246000fd5b6000600182016124435761244361241b565b5060010190565b634e487b7160e01b600052603260045260246000fd5b600081600019048311821515161561247a5761247a61241b565b500290565b60008261249c57634e487b7160e01b600052601260045260246000fd5b500490565b6000828210156124b3576124b361241b565b500390565b6000602082840312156124ca57600080fd5b5051919050565b600082198211156124e4576124e461241b565b500190565b6000602082840312156124fb57600080fd5b8151611a95816121e0565b60008251612518818460208701612165565b919091019291505056fea164736f6c634300080d000a";

type FarmingPoolConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FarmingPoolConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FarmingPool__factory extends ContractFactory {
  constructor(...args: FarmingPoolConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _furion: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FarmingPool> {
    return super.deploy(_furion, overrides || {}) as Promise<FarmingPool>;
  }
  override getDeployTransaction(
    _furion: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_furion, overrides || {});
  }
  override attach(address: string): FarmingPool {
    return super.attach(address) as FarmingPool;
  }
  override connect(signer: Signer): FarmingPool__factory {
    return super.connect(signer) as FarmingPool__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FarmingPoolInterface {
    return new utils.Interface(_abi) as FarmingPoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FarmingPool {
    return new Contract(address, _abi, signerOrProvider) as FarmingPool;
  }
}
