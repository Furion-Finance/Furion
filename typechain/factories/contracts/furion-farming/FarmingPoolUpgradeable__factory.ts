/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides, Signer, utils } from "ethers";

import type { PromiseOrValue } from "../../../common";
import type {
  FarmingPoolUpgradeable,
  FarmingPoolUpgradeableInterface,
} from "../../../contracts/furion-farming/FarmingPoolUpgradeable";

const _abi = [
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
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
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
        internalType: "struct FarmingPoolUpgradeable.PoolInfo[]",
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
        internalType: "address",
        name: "_furion",
        type: "address",
      },
    ],
    name: "initialize",
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
    name: "setFurionRewards",
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
  "0x608060405234801561001057600080fd5b50612b27806100206000396000f3fe608060405234801561001057600080fd5b50600436106101c45760003560e01c80638da5cb5b116100f9578063c44bef7511610097578063d41dcbea11610071578063d41dcbea14610461578063e6fd48bc14610476578063eced55261461047f578063f2fde38b1461048b57600080fd5b8063c44bef7514610402578063c4d66de814610415578063cdfb6cf31461042857600080fd5b80639c7a8293116100d35780639c7a8293146103a6578063a06ddcb3146103b9578063bcedbe2b146103dc578063c24c016e146103ef57600080fd5b80638da5cb5b14610327578063909ff8281461034c57806393f1a40b1461035f57600080fd5b8063441a3e7011610166578063630b5ba111610140578063630b5ba1146102fc578063715018a6146103045780637b0472f01461030c5780638456cb591461031f57600080fd5b8063441a3e70146102bf57806351eb05a6146102d25780635c975abb146102e557600080fd5b806318fccc76116101a257806318fccc76146102475780632a48235b1461025a5780632c678a3e146102975780633f4ba83a146102b757600080fd5b806306fdde03146101c95780630dec23121461021b57806317fb77de14610230575b600080fd5b6102056040518060400160405280601681526020017f467572696f6e204c50204661726d696e6720506f6f6c0000000000000000000081525081565b604051610212919061278e565b60405180910390f35b61022e6102293660046127e6565b61049e565b005b61023960ca5481565b604051908152602001610212565b61022e610255366004612826565b6107a1565b61026d610268366004612852565b6109e5565b604080516001600160a01b0390951685526020850193909352918301526060820152608001610212565b6102396102a536600461286b565b60cd6020526000908152604090205481565b61022e610a29565b61022e6102cd366004612886565b610a8d565b61022e6102e0366004612852565b610d8a565b60975460ff165b6040519015158152602001610212565b61022e610f3f565b61022e610f83565b61022e61031a366004612886565b610fe7565b61022e6112ae565b6033546001600160a01b03165b6040516001600160a01b039091168152602001610212565b60c954610334906001600160a01b031681565b61039161036d366004612826565b60cf6020908152600092835260408084209091529082529020805460019091015482565b60408051928352602083019190915201610212565b61022e6103b43660046128f4565b611310565b6102ec6103c7366004612852565b60ce6020526000908152604090205460ff1681565b6102396103ea366004612826565b611459565b61022e6103fd366004612978565b611651565b61022e610410366004612852565b6118d0565b61022e61042336600461286b565b6119fd565b610239610436366004612826565b600091825260cf602090815260408084206001600160a01b0393909316845291905290206001015490565b610469611be7565b60405161021291906129a6565b61023960cb5481565b61023964e8d4a5100081565b61022e61049936600461286b565b611c71565b826001600160a01b0381166104fa5760405162461bcd60e51b815260206004820152601a60248201527f4641524d494e475f504f4f4c3a205a45524f5f4144445245535300000000000060448201526064015b60405180910390fd5b6033546001600160a01b031633146105545760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104f1565b60975460ff161561059a5760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b60448201526064016104f1565b6105a384611d53565b156105f05760405162461bcd60e51b815260206004820152601d60248201527f4641524d494e475f504f4f4c3a20414c52454144595f494e5f504f4f4c00000060448201526064016104f1565b81156105fe576105fe610f3f565b600060cb5442116106115760cb54610613565b425b604080516080810182526001600160a01b0388811682526020820188815292820184815260006060840181815260cc8054600181018255925293517f47197230e1e4b29fc0bd84d7d78966c0925452aff72a2a121538b102457e9ebe6004909202918201805473ffffffffffffffffffffffffffffffffffffffff1916919094161790925592517f47197230e1e4b29fc0bd84d7d78966c0925452aff72a2a121538b102457e9ebf82015591517f47197230e1e4b29fc0bd84d7d78966c0925452aff72a2a121538b102457e9ec0830155517f47197230e1e4b29fc0bd84d7d78966c0925452aff72a2a121538b102457e9ec1909101559050831561072f5760ca54600090815260ce60205260409020805460ff191660011790555b60ca805490600061073f83612a29565b909155506001600160a01b038616600081815260cd60209081526040918290209390935580519182529181018690527f38bff197ec9fef6e32271789b78dca0f10af5b2b546ce690a67899f608ba4f4c91015b60405180910390a15050505050565b6002606554036107f35760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016104f1565b600260655560975460ff161561083e5760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b60448201526064016104f1565b600082815260ce602052604090205460ff161561085e5761085e82610d8a565b600060cc838154811061087357610873612a42565b6000918252602080832060408051608081018252600490940290910180546001600160a01b03168452600180820154858501526002820154858401526003909101546060850190815288865260cf84528286203387529093529084208054925191810154939550939264e8d4a51000916108ec91612a58565b6108f69190612a77565b6109009190612a99565b9050600081116109525760405162461bcd60e51b815260206004820152601f60248201527f4641524d494e475f504f4f4c3a204e4f5f50454e44494e475f5245574152440060448201526064016104f1565b64e8d4a510008360600151836001015461096c9190612a58565b6109769190612a77565b825560006109848583611d84565b604080513381526001600160a01b0388166020820152908101889052606081018290529091507fdec9257d126f56798a34ce7ca0ffedeaa9a024543946f79c3b5038035ba32a1e906080015b60405180910390a15050600160655550505050565b60cc81815481106109f557600080fd5b600091825260209091206004909102018054600182015460028301546003909301546001600160a01b039092169350919084565b6033546001600160a01b03163314610a835760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104f1565b610a8b611e8d565b565b600260655403610adf5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016104f1565b600260655560975460ff1615610b2a5760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b60448201526064016104f1565b60008111610b7a5760405162461bcd60e51b815260206004820152601b60248201527f4641524d494e475f504f4f4c3a2057495448445241575f5a45524f000000000060448201526064016104f1565b600060cc8381548110610b8f57610b8f612a42565b6000918252602080832086845260cf825260408085203386529092529220600181015460049092029092019250831115610c315760405162461bcd60e51b815260206004820152602760248201527f4641524d494e475f504f4f4c3a204e4f5f454e4f5547485f5354414b494e475f60448201527f42414c414e43450000000000000000000000000000000000000000000000000060648201526084016104f1565b600084815260ce602052604090205460ff1615610c5157610c5184610d8a565b6000816000015464e8d4a5100084600301548460010154610c729190612a58565b610c7c9190612a77565b610c869190612a99565b90506000610c943383611d84565b60408051338082526020820152908101889052606081018290529091507fdec9257d126f56798a34ce7ca0ffedeaa9a024543946f79c3b5038035ba32a1e9060800160405180910390a18354600090610cfa906001906001600160a01b03163389611f29565b905080846001016000828254610d109190612a99565b90915550506003850154600185015464e8d4a5100091610d2f91612a58565b610d399190612a77565b845560408051338152602081018990529081018290527ff279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b5689060600160405180910390a1505060016065555050505050565b600060cc8281548110610d9f57610d9f612a42565b9060005260206000209060040201905080600201544211610dbe575050565b80546040516370a0823160e01b81523060048201526000916001600160a01b0316906370a0823190602401602060405180830381865afa158015610e06573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e2a9190612ab0565b905080600003610e3f57504260029091015550565b6000826002015442610e519190612a99565b90506000836001015482610e659190612a58565b905082610e7764e8d4a5100083612a58565b610e819190612a77565b846003016000828254610e949190612ac9565b909155505060c954604051632b2cea1960e21b8152306004820152602481018390526001600160a01b039091169063acb3a86490604401600060405180830381600087803b158015610ee557600080fd5b505af1158015610ef9573d6000803e3d6000fd5b5050426002870155505060038401546040805187815260208101929092527f7fa9647ec1cc14e3822b46d05a2b9d4e019bde8875c0088c46b6503d71bf17229101610792565b60cc5460005b81811015610f7f57600081815260ce602052604090205460ff1615610f6d57610f6d81610d8a565b80610f7781612a29565b915050610f45565b5050565b6033546001600160a01b03163314610fdd5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104f1565b610a8b6000612062565b6002606554036110395760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016104f1565b600260655560975460ff16156110845760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b60448201526064016104f1565b600082815260ce6020526040902054829060ff166110e45760405162461bcd60e51b815260206004820152601e60248201527f4641524d494e475f504f4f4c3a20504f4f4c5f4e4f545f4641524d494e47000060448201526064016104f1565b600082116111345760405162461bcd60e51b815260206004820152601860248201527f4641524d494e475f504f4f4c3a205354414b455f5a45524f000000000000000060448201526064016104f1565b600060cc848154811061114957611149612a42565b6000918252602080832087845260cf8252604080852033865290925292206004909102909101915061117a85610d8a565b600181015415611214576000816000015464e8d4a51000846003015484600101546111a59190612a58565b6111af9190612a77565b6111b99190612a99565b905060006111c73383611d84565b60408051338082526020820152908101899052606081018290529091507fdec9257d126f56798a34ce7ca0ffedeaa9a024543946f79c3b5038035ba32a1e9060800160405180910390a150505b815460009061122f9082906001600160a01b03163388611f29565b9050808260010160008282546112459190612ac9565b90915550506003830154600183015464e8d4a510009161126491612a58565b61126e9190612a77565b825560408051338152602081018890529081018290527f5af417134f72a9d41143ace85b0a26dce6f550f894f2cbc1eeee8810603d91b6906060016109d0565b6033546001600160a01b031633146113085760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104f1565b610a8b6120c1565b6033546001600160a01b0316331461136a5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104f1565b60975460ff16156113b05760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b60448201526064016104f1565b8360098111156114025760405162461bcd60e51b815260206004820152601c60248201527f4641524d494e475f504f4f4c3a204d4f52455f5448414e5f4e494e450000000060448201526064016104f1565b60005b818110156114505761144887878381811061142257611422612a42565b9050602002013586868481811061143b5761143b612a42565b9050602002013585611651565b600101611405565b50505050505050565b60008060cc848154811061146f5761146f612a42565b600091825260209182902060408051608081018252600490930290910180546001600160a01b0316835260018101549383019390935260028301549082018190526003909201546060820152915015806114cc5750806040015142105b806114d8575060cb5442105b156114e757600091505061164b565b600084815260cf602090815260408083206001600160a01b038781168552908352818420825180840184528154815260019091015493810193909352845191516370a0823160e01b81523060048201529293929116906370a0823190602401602060405180830381865afa158015611563573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115879190612ab0565b606084015190915060008290036115a557600094505050505061164b565b600087815260ce602052604090205460ff161561160d5760008460400151426115ce9190612a99565b905060008186602001516115e29190612a58565b9050836115f464e8d4a5100083612a58565b6115fe9190612a77565b6116089084612ac9565b925050505b6000836000015164e8d4a5100083866020015161162a9190612a58565b6116349190612a77565b61163e9190612a99565b955061164b945050505050565b92915050565b6033546001600160a01b031633146116ab5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104f1565b60975460ff16156116f15760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b60448201526064016104f1565b60cc838154811061170457611704612a42565b9060005260206000209060040201600201546000036117655760405162461bcd60e51b815260206004820152601c60248201527f4641524d494e475f504f4f4c3a20504f4f4c5f4e4f545f45584953540000000060448201526064016104f1565b801561177857611773610f3f565b611781565b61178183610d8a565b600083815260ce602052604090205460ff161580156117a05750600082115b1561180257600083815260ce602052604090819020805460ff19166001179055517f6140f1d5adcbca6c6b24c3b5e695335cd1a2071c7e03881172dc9eb0e488225c906117f99085904290918252602082015260400190565b60405180910390a15b8160000361186857600083815260ce602052604090819020805460ff19169055517f4654f9b7bb3ba4d66e3a4e972e39db189ac7b4fdf5f2a95d57a4eb4d91a16d459061185b9085904290918252602082015260400190565b60405180910390a1505050565b8160cc848154811061187c5761187c612a42565b9060005260206000209060040201600101819055507f0226e7c985ca3cd56b9373c9d63f632fc54d30a22623f59774a07db772041467838360405161185b929190918252602082015260400190565b505050565b6033546001600160a01b0316331461192a5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104f1565b60975460ff16156119705760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b60448201526064016104f1565b60ca546001146119c25760405162461bcd60e51b815260206004820152601460248201527f414c52454144595f484156494e475f504f4f4c5300000000000000000000000060448201526064016104f1565b60cb8190556040518181527faf8fc8a4c9a55a9a29c3e99cd1797d43062c696f192896c79cbebd7da3286d829060200160405180910390a150565b6000611a09600161213c565b90508015611a21576000805461ff0019166101001790555b6001600160a01b038216611a775760405162461bcd60e51b815260206004820152601a60248201527f4641524d494e475f504f4f4c3a205a45524f5f4144445245535300000000000060448201526064016104f1565b611a7f612257565b611a876122ca565b611a8f61233c565b60c980546001600160a01b0380851673ffffffffffffffffffffffffffffffffffffffff1992831617909255600160ca819055604080516080810182526000808252602082018181529282018181526060830182815260cc80549687018155909252915160049094027f47197230e1e4b29fc0bd84d7d78966c0925452aff72a2a121538b102457e9ebe81018054959097169490951693909317909455517f47197230e1e4b29fc0bd84d7d78966c0925452aff72a2a121538b102457e9ebf83015591517f47197230e1e4b29fc0bd84d7d78966c0925452aff72a2a121538b102457e9ec082015590517f47197230e1e4b29fc0bd84d7d78966c0925452aff72a2a121538b102457e9ec1909101558015610f7f576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15050565b606060cc805480602002602001604051908101604052809291908181526020016000905b82821015611c68576000848152602090819020604080516080810182526004860290920180546001600160a01b03168352600180820154848601526002820154928401929092526003015460608301529083529092019101611c0b565b50505050905090565b6033546001600160a01b03163314611ccb5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104f1565b6001600160a01b038116611d475760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f646472657373000000000000000000000000000000000000000000000000000060648201526084016104f1565b611d5081612062565b50565b6001600160a01b038116600090815260cd6020526040812054808203611d7a576000611d7d565b60015b9392505050565b60c9546040516370a0823160e01b815230600482015260009182916001600160a01b03909116906370a0823190602401602060405180830381865afa158015611dd1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611df59190612ab0565b905060008111611e475760405162461bcd60e51b815260206004820152601c60248201527f4641524d494e475f504f4f4c3a204e4f5f4655525f494e5f504f4f4c0000000060448201526064016104f1565b80831115611e6d5760c954611e66906001600160a01b031685836123b3565b905061164b565b60c954611e84906001600160a01b031685856123b3565b8291505061164b565b60975460ff16611edf5760405162461bcd60e51b815260206004820152601460248201527f5061757361626c653a206e6f742070617573656400000000000000000000000060448201526064016104f1565b6097805460ff191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b6040516001600160a01b03909116815260200160405180910390a1565b6040516370a0823160e01b815230600482015260009081906001600160a01b038616906370a0823190602401602060405180830381865afa158015611f72573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f969190612ab0565b90508515611fb757611fb26001600160a01b03861685856123b3565b611fcc565b611fcc6001600160a01b038616853086612443565b6040516370a0823160e01b81523060048201526000906001600160a01b038716906370a0823190602401602060405180830381865afa158015612013573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906120379190612ab0565b90508661204d576120488282612a99565b612057565b6120578183612a99565b979650505050505050565b603380546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b60975460ff16156121075760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b60448201526064016104f1565b6097805460ff191660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258611f0c3390565b60008054610100900460ff16156121ca578160ff16600114801561215f5750303b155b6121c25760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084016104f1565b506000919050565b60005460ff8084169116106122385760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084016104f1565b506000805460ff191660ff92909216919091179055600190565b919050565b600054610100900460ff166122c25760405162461bcd60e51b815260206004820152602b60248201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960448201526a6e697469616c697a696e6760a81b60648201526084016104f1565b610a8b612481565b600054610100900460ff166123355760405162461bcd60e51b815260206004820152602b60248201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960448201526a6e697469616c697a696e6760a81b60648201526084016104f1565b6001606555565b600054610100900460ff166123a75760405162461bcd60e51b815260206004820152602b60248201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960448201526a6e697469616c697a696e6760a81b60648201526084016104f1565b6097805460ff19169055565b6040516001600160a01b0383166024820152604481018290526118cb90849063a9059cbb60e01b906064015b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff00000000000000000000000000000000000000000000000000000000909316929092179091526124f5565b6040516001600160a01b038085166024830152831660448201526064810182905261247b9085906323b872dd60e01b906084016123df565b50505050565b600054610100900460ff166124ec5760405162461bcd60e51b815260206004820152602b60248201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960448201526a6e697469616c697a696e6760a81b60648201526084016104f1565b610a8b33612062565b600061254a826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b03166125da9092919063ffffffff16565b8051909150156118cb57808060200190518101906125689190612ae1565b6118cb5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f7420737563636565640000000000000000000000000000000000000000000060648201526084016104f1565b60606125e984846000856125f1565b949350505050565b6060824710156126695760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c000000000000000000000000000000000000000000000000000060648201526084016104f1565b6001600160a01b0385163b6126c05760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064016104f1565b600080866001600160a01b031685876040516126dc9190612afe565b60006040518083038185875af1925050503d8060008114612719576040519150601f19603f3d011682016040523d82523d6000602084013e61271e565b606091505b509150915061205782828660608315612738575081611d7d565b8251156127485782518084602001fd5b8160405162461bcd60e51b81526004016104f1919061278e565b60005b8381101561277d578181015183820152602001612765565b8381111561247b5750506000910152565b60208152600082518060208401526127ad816040850160208701612762565b601f01601f19169190910160400192915050565b80356001600160a01b038116811461225257600080fd5b8015158114611d5057600080fd5b6000806000606084860312156127fb57600080fd5b612804846127c1565b925060208401359150604084013561281b816127d8565b809150509250925092565b6000806040838503121561283957600080fd5b82359150612849602084016127c1565b90509250929050565b60006020828403121561286457600080fd5b5035919050565b60006020828403121561287d57600080fd5b611d7d826127c1565b6000806040838503121561289957600080fd5b50508035926020909101359150565b60008083601f8401126128ba57600080fd5b50813567ffffffffffffffff8111156128d257600080fd5b6020830191508360208260051b85010111156128ed57600080fd5b9250929050565b60008060008060006060868803121561290c57600080fd5b853567ffffffffffffffff8082111561292457600080fd5b61293089838a016128a8565b9097509550602088013591508082111561294957600080fd5b50612956888289016128a8565b909450925050604086013561296a816127d8565b809150509295509295909350565b60008060006060848603121561298d57600080fd5b8335925060208401359150604084013561281b816127d8565b602080825282518282018190526000919060409081850190868401855b82811015612a0657815180516001600160a01b031685528681015187860152858101518686015260609081015190850152608090930192908501906001016129c3565b5091979650505050505050565b634e487b7160e01b600052601160045260246000fd5b600060018201612a3b57612a3b612a13565b5060010190565b634e487b7160e01b600052603260045260246000fd5b6000816000190483118215151615612a7257612a72612a13565b500290565b600082612a9457634e487b7160e01b600052601260045260246000fd5b500490565b600082821015612aab57612aab612a13565b500390565b600060208284031215612ac257600080fd5b5051919050565b60008219821115612adc57612adc612a13565b500190565b600060208284031215612af357600080fd5b8151611d7d816127d8565b60008251612b10818460208701612762565b919091019291505056fea164736f6c634300080d000a";

type FarmingPoolUpgradeableConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FarmingPoolUpgradeableConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FarmingPoolUpgradeable__factory extends ContractFactory {
  constructor(...args: FarmingPoolUpgradeableConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<FarmingPoolUpgradeable> {
    return super.deploy(overrides || {}) as Promise<FarmingPoolUpgradeable>;
  }
  override getDeployTransaction(overrides?: Overrides & { from?: PromiseOrValue<string> }): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FarmingPoolUpgradeable {
    return super.attach(address) as FarmingPoolUpgradeable;
  }
  override connect(signer: Signer): FarmingPoolUpgradeable__factory {
    return super.connect(signer) as FarmingPoolUpgradeable__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FarmingPoolUpgradeableInterface {
    return new utils.Interface(_abi) as FarmingPoolUpgradeableInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): FarmingPoolUpgradeable {
    return new Contract(address, _abi, signerOrProvider) as FarmingPoolUpgradeable;
  }
}
