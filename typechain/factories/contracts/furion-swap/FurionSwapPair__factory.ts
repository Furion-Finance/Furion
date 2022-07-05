/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { PromiseOrValue } from "../../../common";
import type {
  FurionSwapPair,
  FurionSwapPairInterface,
} from "../../../contracts/furion-swap/FurionSwapPair";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";

const _abi = [
  {
    inputs: [],
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
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "Burn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    name: "Mint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "reserve0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reserve1",
        type: "uint256",
      },
    ],
    name: "ReserveUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0In",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1In",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0Out",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1Out",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "Swap",
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
    inputs: [],
    name: "MINIMUM_LIQUIDITY",
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
        name: "_to",
        type: "address",
      },
    ],
    name: "burn",
    outputs: [
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "feeRate",
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
    name: "getReserves",
    outputs: [
      {
        internalType: "uint256",
        name: "_reserve0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_reserve1",
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
    inputs: [
      {
        internalType: "address",
        name: "_tokenA",
        type: "address",
      },
      {
        internalType: "address",
        name: "_tokenB",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "kLast",
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
        name: "_to",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [
      {
        internalType: "uint256",
        name: "liquidity",
        type: "uint256",
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
        internalType: "uint256",
        name: "_amount0Out",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_amount1Out",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
    ],
    name: "swap",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "sync",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token0",
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
    name: "token1",
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
];

const _bytecode =
  "0x60806040526003600b553480156200001657600080fd5b506040518060400160405280601381526020017f467572696f6e205377617020506f6f6c204c5000000000000000000000000000815250604051806040016040528060038152602001621194d360ea1b815250816003908051906020019062000081929190620000b7565b50805162000097906004906020840190620000b7565b5050600160055550600680546001600160a01b0319163317905562000199565b828054620000c5906200015d565b90600052602060002090601f016020900481019282620000e9576000855562000134565b82601f106200010457805160ff191683800117855562000134565b8280016001018555821562000134579182015b828111156200013457825182559160200191906001019062000117565b506200014292915062000146565b5090565b5b8082111562000142576000815560010162000147565b600181811c908216806200017257607f821691505b6020821081036200019357634e487b7160e01b600052602260045260246000fd5b50919050565b6120b880620001a96000396000f3fe608060405234801561001057600080fd5b506004361061018d5760003560e01c806370a08231116100e3578063a9059cbb1161008c578063d21220a711610066578063d21220a714610334578063dd62ed3e14610347578063fff6cae91461038057600080fd5b8063a9059cbb14610305578063ba9a7a5614610318578063c45a01551461032157600080fd5b806395d89b41116100bd57806395d89b41146102e1578063978bbdb9146102e9578063a457c2d7146102f257600080fd5b806370a082311461029c5780637464fc3d146102c557806389afcb44146102ce57600080fd5b806323b872dd11610145578063485cc9551161011f578063485cc955146102615780636a627842146102765780636d9a640a1461028957600080fd5b806323b872dd1461022c578063313ce5671461023f578063395093511461024e57600080fd5b8063095ea7b311610176578063095ea7b3146101cc5780630dfe1681146101ef57806318160ddd1461021a57600080fd5b806306fdde03146101925780630902f1ac146101b0575b600080fd5b61019a610388565b6040516101a79190611e36565b60405180910390f35b600954600a545b604080519283526020830191909152016101a7565b6101df6101da366004611e81565b61041a565b60405190151581526020016101a7565b600754610202906001600160a01b031681565b6040516001600160a01b0390911681526020016101a7565b6002545b6040519081526020016101a7565b6101df61023a366004611ead565b610432565b604051601281526020016101a7565b6101df61025c366004611e81565b610458565b61027461026f366004611eee565b610497565b005b61021e610284366004611f27565b61058a565b610274610297366004611f44565b61085b565b61021e6102aa366004611f27565b6001600160a01b031660009081526020819052604090205490565b61021e600c5481565b6101b76102dc366004611f27565b610d04565b61019a611086565b61021e600b5481565b6101df610300366004611e81565b611095565b6101df610313366004611e81565b61114a565b61021e6103e881565b600654610202906001600160a01b031681565b600854610202906001600160a01b031681565b61021e610355366004611eee565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b610274611158565b60606003805461039790611f7d565b80601f01602080910402602001604051908101604052809291908181526020018280546103c390611f7d565b80156104105780601f106103e557610100808354040283529160200191610410565b820191906000526020600020905b8154815290600101906020018083116103f357829003601f168201915b5050505050905090565b600033610428818585611295565b5060019392505050565b6000336104408582856113b9565b61044b85858561144b565b60019150505b9392505050565b3360008181526001602090815260408083206001600160a01b03871684529091528120549091906104289082908690610492908790611fc7565b611295565b6006546001600160a01b0316331461051c5760405162461bcd60e51b815260206004820152602f60248201527f63616e206f6e6c7920626520696e697469616c697a656420627920746865206660448201527f6163746f727920636f6e7472616374000000000000000000000000000000000060648201526084015b60405180910390fd5b806001600160a01b0316826001600160a01b03161061053c57808261053f565b81815b600880546001600160a01b039283167fffffffffffffffffffffffff000000000000000000000000000000000000000091821617909155600780549390921692169190911790555050565b60006002600554036105de5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610513565b60026005556000806105f3600954600a549091565b6007546040516370a0823160e01b81523060048201529294509092506000916001600160a01b03909116906370a0823190602401602060405180830381865afa158015610644573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106689190611fdf565b6008546040516370a0823160e01b81523060048201529192506000916001600160a01b03909116906370a0823190602401602060405180830381865afa1580156106b6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106da9190611fdf565b905060006106e88584611ff8565b905060006106f68584611ff8565b905060006107048787611648565b9050600061071160025490565b90508060000361075a576103e861073061072b858761200f565b611823565b61073a9190611ff8565b600654909950610755906001600160a01b03166103e8611893565b61078f565b61078c88610768838761200f565b610772919061202e565b8861077d848761200f565b610787919061202e565b611972565b98505b600089116107df5760405162461bcd60e51b815260206004820152601d60248201527f696e73756666696369656e74206c6971756964697479206d696e7465640000006044820152606401610513565b6107e98a8a611893565b6107f38686611988565b811561080d57600a54600954610809919061200f565b600c555b604080518581526020810185905233917f4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f910160405180910390a25050600160055550949695505050505050565b6002600554036108ad5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610513565b6002600555821515806108c05750600082115b6109165760405162461bcd60e51b815260206004820152602160248201527f4f757470757420616d6f756e74206e65656420746f20626520706f73697469766044820152606560f81b6064820152608401610513565b600080610926600954600a549091565b91509150818510801561093857508084105b6109845760405162461bcd60e51b815260206004820152601460248201527f4e6f7420656e6f756768206c69717569646974790000000000000000000000006044820152606401610513565b60075460085460009182916001600160a01b039182169190811690871682148015906109c25750806001600160a01b0316876001600160a01b031614155b610a0e5760405162461bcd60e51b815260206004820152600a60248201527f494e56414c49445f544f000000000000000000000000000000000000000000006044820152606401610513565b8815610a2857610a286001600160a01b038316888b6119d3565b8715610a4257610a426001600160a01b038216888a6119d3565b6040516370a0823160e01b81523060048201526001600160a01b038316906370a0823190602401602060405180830381865afa158015610a86573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aaa9190611fdf565b6040516370a0823160e01b81523060048201529094506001600160a01b038216906370a0823190602401602060405180830381865afa158015610af1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b159190611fdf565b9250505060008785610b279190611ff8565b8311610b34576000610b48565b610b3e8886611ff8565b610b489084611ff8565b90506000610b568886611ff8565b8311610b63576000610b77565b610b6d8886611ff8565b610b779084611ff8565b90506000821180610b885750600081115b610bd45760405162461bcd60e51b815260206004820152601960248201527f494e53554646494349454e545f494e5055545f414d4f554e54000000000000006044820152606401610513565b6000600b5483610be4919061200f565b610bf0866103e861200f565b610bfa9190611ff8565b90506000600b5483610c0c919061200f565b610c18866103e861200f565b610c229190611ff8565b9050610c2e878961200f565b610c3b90620f424061200f565b610c45828461200f565b1015610c935760405162461bcd60e51b815260206004820181905260248201527f5468652072656d61696e696e6720782a79206973206c657373207468616e204b6044820152606401610513565b5050610c9f8484611988565b60408051838152602081018390529081018a9052606081018990526001600160a01b0388169033907fd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d8229060800160405180910390a35050600160055550505050505050565b600080600260055403610d595760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610513565b60026005556007546008546040516370a0823160e01b81523060048201526001600160a01b03928316929091169060009083906370a0823190602401602060405180830381865afa158015610db2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dd69190611fdf565b6040516370a0823160e01b81523060048201529091506000906001600160a01b038416906370a0823190602401602060405180830381865afa158015610e20573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e449190611fdf565b30600090815260208190526040812054919250506000610e68600954600a54611648565b90506000610e7560025490565b905080610e82868561200f565b610e8c919061202e565b985080610e99858561200f565b610ea3919061202e565b9750600089118015610eb55750600088115b610f015760405162461bcd60e51b815260206004820152601d60248201527f496e73756666696369656e74206c6971756964697479206275726e65640000006044820152606401610513565b610f0b3084611a3f565b610f1f6001600160a01b0388168b8b6119d3565b610f336001600160a01b0387168b8a6119d3565b6040516370a0823160e01b81523060048201526001600160a01b038816906370a0823190602401602060405180830381865afa158015610f77573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f9b9190611fdf565b6040516370a0823160e01b81523060048201529095506001600160a01b038716906370a0823190602401602060405180830381865afa158015610fe2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110069190611fdf565b93506110128585611988565b811561102c57600a54600954611028919061200f565b600c555b604080518a8152602081018a90526001600160a01b038c169133917fdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496910160405180910390a3505050505050506001600581905550915091565b60606004805461039790611f7d565b3360008181526001602090815260408083206001600160a01b0387168452909152812054909190838110156111325760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f0000000000000000000000000000000000000000000000000000006064820152608401610513565b61113f8286868403611295565b506001949350505050565b60003361042881858561144b565b6002600554036111aa5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610513565b60026005556007546040516370a0823160e01b815230600482015261128e916001600160a01b0316906370a0823190602401602060405180830381865afa1580156111f9573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061121d9190611fdf565b6008546040516370a0823160e01b81523060048201526001600160a01b03909116906370a0823190602401602060405180830381865afa158015611265573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112899190611fdf565b611988565b6001600555565b6001600160a01b0383166112f75760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610513565b6001600160a01b0382166113585760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610513565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b03838116600090815260016020908152604080832093861683529290522054600019811461144557818110156114385760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000006044820152606401610513565b6114458484848403611295565b50505050565b6001600160a01b0383166114c75760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f64726573730000000000000000000000000000000000000000000000000000006064820152608401610513565b6001600160a01b0382166115295760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610513565b6001600160a01b038316600090815260208190526040902054818110156115b85760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e636500000000000000000000000000000000000000000000000000006064820152608401610513565b6001600160a01b038085166000908152602081905260408082208585039055918516815290812080548492906115ef908490611fc7565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161163b91815260200190565b60405180910390a3611445565b600080600660009054906101000a90046001600160a01b03166001600160a01b031663be1bd3316040518163ffffffff1660e01b8152600401602060405180830381865afa15801561169e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116c29190612050565b600c546001600160a01b03821615801594509192509061180f57801561180a5760006116f161072b868861200f565b905060006116fe83611823565b9050808211156118075760006117148284611ff8565b600254611721919061200f565b61172c90600a61200f565b90506000600660009054906101000a90046001600160a01b03166001600160a01b031663786df8ec6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611783573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117a79190611fdf565b905060006117b684600a61200f565b600a6117c4846103e861202e565b6117ce9190611ff8565b6117d8908761200f565b6117e29190611fc7565b905060006117f0828561202e565b90508015611802576118028882611893565b505050505b50505b61181b565b801561181b576000600c555b505092915050565b60006003821115611884575080600061183d60028361202e565b611848906001611fc7565b90505b8181101561187e57905080600281611863818661202e565b61186d9190611fc7565b611877919061202e565b905061184b565b50919050565b811561188e575060015b919050565b6001600160a01b0382166118e95760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401610513565b80600260008282546118fb9190611fc7565b90915550506001600160a01b03821660009081526020819052604081208054839290611928908490611fc7565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b60008183106119815781610451565b5090919050565b6000196009839055600a82905560408051848152602081018490527f32dc813d3f262a05478ad1165d5701040e411d9a6e1684c8c2da1c8e6f3b8022910160405180910390a1505050565b604080516001600160a01b038416602482015260448082018490528251808303909101815260649091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1663a9059cbb60e01b179052611a3a908490611b8d565b505050565b6001600160a01b038216611a9f5760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b6064820152608401610513565b6001600160a01b03821660009081526020819052604090205481811015611b135760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b6064820152608401610513565b6001600160a01b0383166000908152602081905260408120838303905560028054849290611b42908490611ff8565b90915550506040518281526000906001600160a01b038516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a3505050565b6000611be2826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b0316611c729092919063ffffffff16565b805190915015611a3a5780806020019051810190611c00919061206d565b611a3a5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f742073756363656564000000000000000000000000000000000000000000006064820152608401610513565b6060611c818484600085611c89565b949350505050565b606082471015611d015760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c00000000000000000000000000000000000000000000000000006064820152608401610513565b6001600160a01b0385163b611d585760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610513565b600080866001600160a01b03168587604051611d74919061208f565b60006040518083038185875af1925050503d8060008114611db1576040519150601f19603f3d011682016040523d82523d6000602084013e611db6565b606091505b5091509150611dc6828286611dd1565b979650505050505050565b60608315611de0575081610451565b825115611df05782518084602001fd5b8160405162461bcd60e51b81526004016105139190611e36565b60005b83811015611e25578181015183820152602001611e0d565b838111156114455750506000910152565b6020815260008251806020840152611e55816040850160208701611e0a565b601f01601f19169190910160400192915050565b6001600160a01b0381168114611e7e57600080fd5b50565b60008060408385031215611e9457600080fd5b8235611e9f81611e69565b946020939093013593505050565b600080600060608486031215611ec257600080fd5b8335611ecd81611e69565b92506020840135611edd81611e69565b929592945050506040919091013590565b60008060408385031215611f0157600080fd5b8235611f0c81611e69565b91506020830135611f1c81611e69565b809150509250929050565b600060208284031215611f3957600080fd5b813561045181611e69565b600080600060608486031215611f5957600080fd5b83359250602084013591506040840135611f7281611e69565b809150509250925092565b600181811c90821680611f9157607f821691505b60208210810361187e57634e487b7160e01b600052602260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b60008219821115611fda57611fda611fb1565b500190565b600060208284031215611ff157600080fd5b5051919050565b60008282101561200a5761200a611fb1565b500390565b600081600019048311821515161561202957612029611fb1565b500290565b60008261204b57634e487b7160e01b600052601260045260246000fd5b500490565b60006020828403121561206257600080fd5b815161045181611e69565b60006020828403121561207f57600080fd5b8151801515811461045157600080fd5b600082516120a1818460208701611e0a565b919091019291505056fea164736f6c634300080d000a";

type FurionSwapPairConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FurionSwapPairConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FurionSwapPair__factory extends ContractFactory {
  constructor(...args: FurionSwapPairConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FurionSwapPair> {
    return super.deploy(overrides || {}) as Promise<FurionSwapPair>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FurionSwapPair {
    return super.attach(address) as FurionSwapPair;
  }
  override connect(signer: Signer): FurionSwapPair__factory {
    return super.connect(signer) as FurionSwapPair__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FurionSwapPairInterface {
    return new utils.Interface(_abi) as FurionSwapPairInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FurionSwapPair {
    return new Contract(address, _abi, signerOrProvider) as FurionSwapPair;
  }
}
