/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides, Signer, utils } from "ethers";

import type { PromiseOrValue } from "../../../common";
import type { AggregatePool, AggregatePoolInterface } from "../../../contracts/aggregate-pool/AggregatePool";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_fur",
        type: "address",
      },
      {
        internalType: "address",
        name: "_oracle",
        type: "address",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "_tokens",
        type: "address[]",
      },
      {
        internalType: "string",
        name: "_tokenName",
        type: "string",
      },
      {
        internalType: "string",
        name: "_tokenSymbol",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
    ],
    name: "RegisteredToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
    ],
    name: "StakedToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "unstaker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
    ],
    name: "UnstakedToken",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
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
        name: "_newOwner",
        type: "address",
      },
    ],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "circulatingSupply",
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
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
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
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
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
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "nonces",
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
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
    ],
    name: "registerToken",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "registered",
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
        name: "_newStakeFee",
        type: "uint256",
      },
    ],
    name: "setStakeFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newUnstakeFee",
        type: "uint256",
      },
    ],
    name: "setUnstakeFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
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
    name: "stakeFee",
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
    name: "symbol",
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
    name: "tokenTypes",
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
    name: "totalSupply",
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
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unstakeFee",
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
];

const _bytecode =
  "0x61016060405268056bc75e2d63100000600c5568056bc75e2d63100000600d553480156200002c57600080fd5b50604051620023f5380380620023f58339810160408190526200004f91620003e2565b8180604051806040016040528060018152602001603160f81b815250848481600390805190602001906200008592919062000241565b5080516200009b90600490602084019062000241565b5050825160208085019190912083518483012060e08290526101008190524660a0818152604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f81880181905281830187905260608201869052608082019490945230818401528151808203909301835260c0019052805194019390932091935091906080523060c05261012052505033610140525050600780546001600160a01b038981166001600160a01b03199283161790925560088054898416908316179055600980549288169290911691909117905550825160005b8181101562000230576001600a60008784815181106200019b576200019b62000522565b60200260200101516001600160a01b03166001600160a01b0316815260200190815260200160002060006101000a81548160ff021916908315150217905550848181518110620001ef57620001ef62000522565b6020908102919091018101516000838152600b909252604090912080546001600160a01b0319166001600160a01b0390921691909117905560010162000177565b50600e555062000574945050505050565b8280546200024f9062000538565b90600052602060002090601f016020900481019282620002735760008555620002be565b82601f106200028e57805160ff1916838001178555620002be565b82800160010185558215620002be579182015b82811115620002be578251825591602001919060010190620002a1565b50620002cc929150620002d0565b5090565b5b80821115620002cc5760008155600101620002d1565b80516001600160a01b0381168114620002ff57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b038111828210171562000345576200034562000304565b604052919050565b600082601f8301126200035f57600080fd5b81516001600160401b038111156200037b576200037b62000304565b602062000391601f8301601f191682016200031a565b8281528582848701011115620003a657600080fd5b60005b83811015620003c6578581018301518282018401528201620003a9565b83811115620003d85760008385840101525b5095945050505050565b60008060008060008060c08789031215620003fc57600080fd5b6200040787620002e7565b9550602062000418818901620002e7565b95506200042860408901620002e7565b60608901519095506001600160401b03808211156200044657600080fd5b818a0191508a601f8301126200045b57600080fd5b81518181111562000470576200047062000304565b8060051b620004818582016200031a565b918252838101850191858101908e8411156200049c57600080fd5b948601945b83861015620004c557620004b586620002e7565b82529486019490860190620004a1565b60808e0151909950955050505080831115620004e057600080fd5b620004ee8b848c016200034d565b945060a08a01519250808311156200050557600080fd5b50506200051589828a016200034d565b9150509295509295509295565b634e487b7160e01b600052603260045260246000fd5b600181811c908216806200054d57607f821691505b6020821081036200056e57634e487b7160e01b600052602260045260246000fd5b50919050565b60805160a05160c05160e051610100516101205161014051611e18620005dd6000396000818161038e01528181610797015261131f0152600061125e015260006112ad01526000611288015260006111e10152600061120b015260006112350152611e186000f3fe608060405234801561001057600080fd5b50600436106101b85760003560e01c80638ea97d26116100f9578063b2951e0911610097578063c45a015511610071578063c45a015514610389578063d505accf146103b0578063dd62ed3e146103c3578063e2d7bee4146103fc57600080fd5b8063b2951e091461034a578063b2dd5c0714610353578063c2a672e01461037657600080fd5b8063a457c2d7116100d3578063a457c2d7146102fe578063a6f9dae114610311578063a9059cbb14610324578063adc9772e1461033757600080fd5b80638ea97d26146102e55780639358928b146102ee57806395d89b41146102f657600080fd5b806323b872dd116101665780633950935111610140578063395093511461026b57806370a082311461027e5780637ecebe00146102a75780638da5cb5b146102ba57600080fd5b806323b872dd14610241578063313ce567146102545780633644e5151461026357600080fd5b806309824a801161019757806309824a801461021357806318160ddd14610226578063222c97771461023857600080fd5b806218a116146101bd57806306fdde03146101d2578063095ea7b3146101f0575b600080fd5b6101d06101cb366004611b0d565b61040f565b005b6101da610481565b6040516101e79190611b26565b60405180910390f35b6102036101fe366004611b90565b610513565b60405190151581526020016101e7565b6101d0610221366004611bbc565b61052b565b6002545b6040519081526020016101e7565b61022a600c5481565b61020361024f366004611bd9565b610636565b604051601281526020016101e7565b61022a61065a565b610203610279366004611b90565b610669565b61022a61028c366004611bbc565b6001600160a01b031660009081526020819052604090205490565b61022a6102b5366004611bbc565b6106a8565b6009546102cd906001600160a01b031681565b6040516001600160a01b0390911681526020016101e7565b61022a600d5481565b61022a6106c8565b6101da6106d3565b61020361030c366004611b90565b6106e2565b6101d061031f366004611bbc565b61078c565b610203610332366004611b90565b610841565b6101d0610345366004611b90565b61084f565b61022a600e5481565b610203610361366004611bbc565b600a6020526000908152604090205460ff1681565b6101d0610384366004611b90565b610a58565b6102cd7f000000000000000000000000000000000000000000000000000000000000000081565b6101d06103be366004611c1a565b610c4f565b61022a6103d1366004611c91565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6101d061040a366004611b0d565b610db3565b6009546001600160a01b0316331461047c5760405162461bcd60e51b815260206004820152602560248201527f416767726567617465506f6f6c3a204e6f74207065726d697474656420746f2060448201526431b0b6361760d91b60648201526084015b60405180910390fd5b600d55565b60606003805461049090611cca565b80601f01602080910402602001604051908101604052809291908181526020018280546104bc90611cca565b80156105095780601f106104de57610100808354040283529160200191610509565b820191906000526020600020905b8154815290600101906020018083116104ec57829003601f168201915b5050505050905090565b600033610521818585610e20565b5060019392505050565b6009546001600160a01b031633146105935760405162461bcd60e51b815260206004820152602560248201527f416767726567617465506f6f6c3a204e6f74207065726d697474656420746f2060448201526431b0b6361760d91b6064820152608401610473565b6001600160a01b0381166000818152600a60209081526040808320805460ff19166001179055600e80548452600b9092528220805473ffffffffffffffffffffffffffffffffffffffff1916909317909255815491906105f283611d14565b90915550506040516001600160a01b03821681527f5d0a1a502538b17810b0b5bb2ec57e41a9f0e4ff2c08490f11f1eef9b0ee9eb29060200160405180910390a150565b600033610644858285610f45565b61064f858585610fd7565b506001949350505050565b60006106646111d4565b905090565b3360008181526001602090815260408083206001600160a01b038716845290915281205490919061052190829086906106a3908790611d2d565b610e20565b6001600160a01b0381166000908152600560205260408120545b92915050565b600061066460025490565b60606004805461049090611cca565b3360008181526001602090815260408083206001600160a01b03871684529091528120549091908381101561077f5760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f0000000000000000000000000000000000000000000000000000006064820152608401610473565b61064f8286868403610e20565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146108125760405162461bcd60e51b815260206004820152602560248201527f416767726567617465506f6f6c3a204e6f74207065726d697474656420746f2060448201526431b0b6361760d91b6064820152608401610473565b6009805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0392909216919091179055565b600033610521818585610fd7565b6001600160a01b0382166000908152600a6020526040902054829060ff1615156001146108d65760405162461bcd60e51b815260206004820152602f60248201527f416767726567617465506f6f6c3a20546f6b656e206e6f74206163636570746560448201526e321034b7103a3434b9903837b7b61760891b6064820152608401610473565b60006108e1846112fb565b905060006108ee85611494565b90506000816108fd8487611d45565b6109079190611d64565b600754600954600c546040516323b872dd60e01b81523360048201526001600160a01b039283166024820152604481019190915292935016906323b872dd906064016020604051808303816000875af1158015610968573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061098c9190611d86565b506040516323b872dd60e01b8152336004820152306024820152604481018690526001600160a01b038716906323b872dd906064016020604051808303816000875af11580156109e0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a049190611d86565b50610a0f33826114d9565b60405185815233906001600160a01b038816907f572917b843dd6132f2ef4857991377e173c54cb472655bad280701adbd372dc4906020015b60405180910390a3505050505050565b6001600160a01b0382166000908152600a6020526040902054829060ff161515600114610adf5760405162461bcd60e51b815260206004820152602f60248201527f416767726567617465506f6f6c3a20546f6b656e206e6f74206163636570746560448201526e321034b7103a3434b9903837b7b61760891b6064820152608401610473565b6000610aea846112fb565b90506000610af785611494565b9050600082610b068387611d45565b610b109190611d64565b600754600954600d546040516323b872dd60e01b81523360048201526001600160a01b039283166024820152604481019190915292935016906323b872dd906064016020604051808303816000875af1158015610b71573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b959190611d86565b50610ba033866115b8565b60405163a9059cbb60e01b8152336004820152602481018290526001600160a01b0387169063a9059cbb906044016020604051808303816000875af1158015610bed573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c119190611d86565b5060405181815233906001600160a01b038816907ff7fc830f89da6bb8e874b580b653a3fb2b6aa4aabcf2289983085a34f133b8b090602001610a48565b83421115610c9f5760405162461bcd60e51b815260206004820152601d60248201527f45524332305065726d69743a206578706972656420646561646c696e650000006044820152606401610473565b60007f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9888888610cce8c6116fe565b6040805160208101969096526001600160a01b0394851690860152929091166060840152608083015260a082015260c0810186905260e0016040516020818303038152906040528051906020012090506000610d2982611724565b90506000610d3982878787611772565b9050896001600160a01b0316816001600160a01b031614610d9c5760405162461bcd60e51b815260206004820152601e60248201527f45524332305065726d69743a20696e76616c6964207369676e617475726500006044820152606401610473565b610da78a8a8a610e20565b50505050505050505050565b6009546001600160a01b03163314610e1b5760405162461bcd60e51b815260206004820152602560248201527f416767726567617465506f6f6c3a204e6f74207065726d697474656420746f2060448201526431b0b6361760d91b6064820152608401610473565b600c55565b6001600160a01b038316610e825760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610473565b6001600160a01b038216610ee35760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610473565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b6001600160a01b038381166000908152600160209081526040808320938616835292905220546000198114610fd15781811015610fc45760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000006044820152606401610473565b610fd18484848403610e20565b50505050565b6001600160a01b0383166110535760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f64726573730000000000000000000000000000000000000000000000000000006064820152608401610473565b6001600160a01b0382166110b55760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610473565b6001600160a01b038316600090815260208190526040902054818110156111445760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e636500000000000000000000000000000000000000000000000000006064820152608401610473565b6001600160a01b0380851660009081526020819052604080822085850390559185168152908120805484929061117b908490611d2d565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516111c791815260200190565b60405180910390a3610fd1565b6000306001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614801561122d57507f000000000000000000000000000000000000000000000000000000000000000046145b1561125757507f000000000000000000000000000000000000000000000000000000000000000090565b50604080517f00000000000000000000000000000000000000000000000000000000000000006020808301919091527f0000000000000000000000000000000000000000000000000000000000000000828401527f000000000000000000000000000000000000000000000000000000000000000060608301524660808301523060a0808401919091528351808403909101815260c0909201909252805191012090565b60405163438493ed60e01b81526001600160a01b03828116600483015260009182917f0000000000000000000000000000000000000000000000000000000000000000169063438493ed90602401602060405180830381865afa158015611366573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061138a9190611da8565b90506001600160a01b0381166114085760405162461bcd60e51b815260206004820152603260248201527f416767726567617465506f6f6c3a20556e7265636f676e697a6564207365706160448201527f7261746520706f6f6c2070726f766964656400000000000000000000000000006064820152608401610473565b60085460405163bc24179360e01b81526001600160a01b03838116600483015260006024830181905292169063bc24179390604401602060405180830381865afa15801561145a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061147e9190611dc5565b905061148c6103e882611d64565b949350505050565b60008061149f6106c8565b9050806000036114b85750662386f26fc1000092915050565b806114c28461179a565b6114cc9190611d64565b9392505050565b50919050565b6001600160a01b03821661152f5760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401610473565b80600260008282546115419190611d2d565b90915550506001600160a01b0382166000908152602081905260408120805483929061156e908490611d2d565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b6001600160a01b0382166116185760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b6064820152608401610473565b6001600160a01b0382166000908152602081905260409020548181101561168c5760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b6064820152608401610473565b6001600160a01b03831660009081526020819052604081208383039055600280548492906116bb908490611dde565b90915550506040518281526000906001600160a01b038516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef90602001610f38565b6001600160a01b03811660009081526005602052604090208054600181018255906114d3565b60006106c26117316111d4565b8360405161190160f01b6020820152602281018390526042810182905260009060620160405160208183030381529060405280519060200120905092915050565b600080600061178387878787611867565b9150915061179081611954565b5095945050505050565b60008060005b600e54811015611860576000818152600b60205260408120546001600160a01b0316906117cc866112fb565b6040516370a0823160e01b81523060048201529091506000906001600160a01b038416906370a0823190602401602060405180830381865afa158015611816573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061183a9190611dc5565b90506118468183611d45565b6118509086611d2d565b94508360010193505050506117a0565b5092915050565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a083111561189e575060009050600361194b565b8460ff16601b141580156118b657508460ff16601c14155b156118c7575060009050600461194b565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa15801561191b573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381166119445760006001925092505061194b565b9150600090505b94509492505050565b600081600481111561196857611968611df5565b036119705750565b600181600481111561198457611984611df5565b036119d15760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606401610473565b60028160048111156119e5576119e5611df5565b03611a325760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606401610473565b6003816004811115611a4657611a46611df5565b03611a9e5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b6064820152608401610473565b6004816004811115611ab257611ab2611df5565b03611b0a5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604482015261756560f01b6064820152608401610473565b50565b600060208284031215611b1f57600080fd5b5035919050565b600060208083528351808285015260005b81811015611b5357858101830151858201604001528201611b37565b81811115611b65576000604083870101525b50601f01601f1916929092016040019392505050565b6001600160a01b0381168114611b0a57600080fd5b60008060408385031215611ba357600080fd5b8235611bae81611b7b565b946020939093013593505050565b600060208284031215611bce57600080fd5b81356114cc81611b7b565b600080600060608486031215611bee57600080fd5b8335611bf981611b7b565b92506020840135611c0981611b7b565b929592945050506040919091013590565b600080600080600080600060e0888a031215611c3557600080fd5b8735611c4081611b7b565b96506020880135611c5081611b7b565b95506040880135945060608801359350608088013560ff81168114611c7457600080fd5b9699959850939692959460a0840135945060c09093013592915050565b60008060408385031215611ca457600080fd5b8235611caf81611b7b565b91506020830135611cbf81611b7b565b809150509250929050565b600181811c90821680611cde57607f821691505b6020821081036114d357634e487b7160e01b600052602260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060018201611d2657611d26611cfe565b5060010190565b60008219821115611d4057611d40611cfe565b500190565b6000816000190483118215151615611d5f57611d5f611cfe565b500290565b600082611d8157634e487b7160e01b600052601260045260246000fd5b500490565b600060208284031215611d9857600080fd5b815180151581146114cc57600080fd5b600060208284031215611dba57600080fd5b81516114cc81611b7b565b600060208284031215611dd757600080fd5b5051919050565b600082821015611df057611df0611cfe565b500390565b634e487b7160e01b600052602160045260246000fdfea164736f6c634300080d000a";

type AggregatePoolConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (xs: AggregatePoolConstructorParams): xs is ConstructorParameters<typeof ContractFactory> =>
  xs.length > 1;

export class AggregatePool__factory extends ContractFactory {
  constructor(...args: AggregatePoolConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _fur: PromiseOrValue<string>,
    _oracle: PromiseOrValue<string>,
    _owner: PromiseOrValue<string>,
    _tokens: PromiseOrValue<string>[],
    _tokenName: PromiseOrValue<string>,
    _tokenSymbol: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<AggregatePool> {
    return super.deploy(
      _fur,
      _oracle,
      _owner,
      _tokens,
      _tokenName,
      _tokenSymbol,
      overrides || {},
    ) as Promise<AggregatePool>;
  }
  override getDeployTransaction(
    _fur: PromiseOrValue<string>,
    _oracle: PromiseOrValue<string>,
    _owner: PromiseOrValue<string>,
    _tokens: PromiseOrValue<string>[],
    _tokenName: PromiseOrValue<string>,
    _tokenSymbol: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): TransactionRequest {
    return super.getDeployTransaction(_fur, _oracle, _owner, _tokens, _tokenName, _tokenSymbol, overrides || {});
  }
  override attach(address: string): AggregatePool {
    return super.attach(address) as AggregatePool;
  }
  override connect(signer: Signer): AggregatePool__factory {
    return super.connect(signer) as AggregatePool__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): AggregatePoolInterface {
    return new utils.Interface(_abi) as AggregatePoolInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): AggregatePool {
    return new Contract(address, _abi, signerOrProvider) as AggregatePool;
  }
}