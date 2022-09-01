/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides, Signer, utils } from "ethers";

import type { PromiseOrValue } from "../../../common";
import type { SafePRBMathTester, SafePRBMathTesterInterface } from "../../../contracts/libraries/SafePRBMathTester";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__CeilOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__Exp2InputTooBig",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__ExpInputTooBig",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__FromUintOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__GmOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__LogInputTooSmall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__SqrtOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prod1",
        type: "uint256",
      },
    ],
    name: "PRBMath__MulDivFixedPointOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prod1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "denominator",
        type: "uint256",
      },
    ],
    name: "PRBMath__MulDivOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "avg",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "ceil",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "div",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "e",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "exp",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "exp2",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "floor",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "frac",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "fromUint",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "gm",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "inv",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "ln",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "log10",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "log2",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "mul",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "pi",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "pow",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "powu",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "scale",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "sqrt",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "toUint",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611fdb806100206000396000f3fe608060405234801561001057600080fd5b50600436106101775760003560e01c80637d2b1efb116100d8578063c8a4ac9c1161008c578063ebdae5f911610066578063ebdae5f9146102df578063f51e181a146102f2578063ffae15ba1461030057600080fd5b8063c8a4ac9c146102a6578063db140068146102b9578063e3814b19146102cc57600080fd5b8063a391c15b116100bd578063a391c15b1461026d578063a75826ae14610280578063b581fbe31461029357600080fd5b80637d2b1efb1461024757806399a04f2f1461025a57600080fd5b80635456bf131161012f578063677342ce11610114578063677342ce1461020e578063728e8c7f146102215780637a142f2e1461023457600080fd5b80635456bf13146101e857806357f5c63c146101fb57600080fd5b80632e4c697f116101605780632e4c697f146101af57806340f0a21f146101c2578063504f5e56146101d557600080fd5b806324d4e90a1461017c5780632dd9868d146101a1575b600080fd5b61018f61018a366004611f57565b61030e565b60405190815260200160405180910390f35b672b992ddfa23249d661018f565b61018f6101bd366004611f70565b61031f565b61018f6101d0366004611f57565b610332565b61018f6101e3366004611f57565b61033d565b61018f6101f6366004611f57565b610355565b61018f610209366004611f57565b610360565b61018f61021c366004611f57565b61036b565b61018f61022f366004611f57565b610376565b61018f610242366004611f57565b610388565b61018f610255366004611f70565b610393565b61018f610268366004611f70565b61039f565b61018f61027b366004611f70565b6103ab565b61018f61028e366004611f57565b6103b7565b61018f6102a1366004611f57565b6103c2565b61018f6102b4366004611f70565b6103cd565b61018f6102c7366004611f70565b6103d9565b61018f6102da366004611f57565b6103f2565b61018f6102ed366004611f57565b6103fd565b670de0b6b3a764000061018f565b6725b946ebc0b3617361018f565b600061031982610408565b92915050565b600061032b838361043a565b9392505050565b60006103198261047c565b6000670de0b6b3a76400008206801515028203610319565b6000610319826104c7565b60006103198261057d565b60006103198261058e565b6000670de0b6b3a76400008206610319565b6000610319826105e0565b600061032b8383610600565b600061032b838361065e565b600061032b83836106b8565b6000610319826106cd565b600061031982610713565b600061032b8383610769565b600061032b8383600182811c82821c0192909116160190565b600061031982610775565b6000610319826107c2565b60006714057b7ef767814f670de0b6b3a7640000610425846104c7565b028161043357610433611f92565b0492915050565b60008260000361046257811561045157600061045b565b670de0b6b3a76400005b9050610319565b61032b610477610471856104c7565b84610769565b6106cd565b600067081ad01a501bffff198211156104b057604051630ecebb1160e31b8152600481018390526024015b60405180910390fd5b50670de0b6b3a76400008082068015159103020190565b6000670de0b6b3a76400008210156104f557604051633621413760e21b8152600481018390526024016104a7565b600061050a670de0b6b3a7640000840461145d565b670de0b6b3a764000081029250905082811c670de0b6b3a763ffff198101610533575050919050565b6706f05b59d3b200005b801561057557670de0b6b3a7640000828002049150671bc16d674ec80000821061056d579283019260019190911c905b60011c61053d565b505050919050565b6000670de0b6b3a764000082610433565b60007812725dd1d243aba0e75fe645cc4873f9e65afe688c928e1f218211156105cd57604051636155b67d60e01b8152600481018390526024016104a7565b610319670de0b6b3a76400008302611541565b6000816ec097ce7bc90715b34b9f10000000008161043357610433611f92565b60008260000361061257506000610319565b8282028284828161062557610625611f92565b041461064d5760405162c3efdf60e01b815260048101859052602481018490526044016104a7565b61065681611541565b949350505050565b600080826001161161067857670de0b6b3a764000061067a565b825b9050600182901c91505b81156103195761069483846116b5565b925060018216156106ac576106a981846116b5565b90505b600182901c9150610684565b600061032b83670de0b6b3a76400008461177b565b6000680a688906bd8b00000082106106fb57604051634a4f26f160e01b8152600481018390526024016104a7565b670de0b6b3a7640000604083901b0461032b81611847565b6000680736ea4425c11ac63182106107415760405163062bb40d60e31b8152600481018390526024016104a7565b6714057b7ef767814f820261032b670de0b6b3a76400006706f05b59d3b200008301046106cd565b600061032b83836116b5565b60007812725dd1d243aba0e75fe645cc4873f9e65afe688c928e1f218211156107b457604051633492ffd960e01b8152600481018390526024016104a7565b50670de0b6b3a76400000290565b6000670de0b6b3a76400008210156107f057604051633621413760e21b8152600481018390526024016104a7565b8160018114610f2357600a8114610f345760648114610f45576103e88114610f56576127108114610f6757620186a08114610f7857620f42408114610f8957629896808114610f9a576305f5e1008114610fab57633b9aca008114610fbc576402540be4008114610fcd5764174876e8008114610fde5764e8d4a510008114610fef576509184e72a000811461100057655af3107a400081146110115766038d7ea4c68000811461102257662386f26fc1000081146110335767016345785d8a0000811461104457670de0b6b3a7640000811461105557678ac7230489e80000811461105e5768056bc75e2d63100000811461106e57683635c9adc5dea00000811461107e5769021e19e0c9bab2400000811461108e5769152d02c7e14af6800000811461109e5769d3c21bcecceda100000081146110ae576a084595161401484a00000081146110be576a52b7d2dcc80cd2e400000081146110ce576b033b2e3c9fd0803ce800000081146110de576b204fce5e3e2502611000000081146110ee576c01431e0fae6d7217caa000000081146110fe576c0c9f2c9cd04674edea40000000811461110e576c7e37be2022c0914b2680000000811461111e576d04ee2d6d415b85acef8100000000811461112e576d314dc6448d9338c15b0a00000000811461113e576e01ed09bead87c0378d8e6400000000811461114e576e13426172c74d822b878fe800000000811461115e576ec097ce7bc90715b34b9f1000000000811461116e576f0785ee10d5da46d900f436a000000000811461117e576f4b3b4ca85a86c47a098a224000000000811461118f577002f050fe938943acc45f6556800000000081146111a057701d6329f1c35ca4bfabb9f561000000000081146111b157710125dfa371a19e6f7cb54395ca000000000081146111c257710b7abc627050305adf14a3d9e4000000000081146111d3577172cb5bd86321e38cb6ce6682e8000000000081146111e45772047bf19673df52e37f2410011d10000000000081146111f557722cd76fe086b93ce2f768a00b22a000000000008114611206577301c06a5ec5433c60ddaa16406f5a40000000000081146112175773118427b3b4a05bc8a8a4de84598680000000000081146112285773af298d050e4395d69670b12b7f410000000000008114611239577406d79f82328ea3da61e066ebb2f88a000000000000811461124a5774446c3b15f9926687d2c40534fdb564000000000000811461125b577502ac3a4edbbfb8014e3ba83411e915e8000000000000811461126c57751aba4714957d300d0e549208b31adb10000000000000811461127d5776010b46c6cdd6e3e0828f4db456ff0c8ea0000000000000811461128e57760a70c3c40a64e6c51999090b65f67d9240000000000000811461129f57766867a5a867f103b2fffa5a71fba0e7b68000000000000081146112b0577704140c78940f6a24fdffc78873d4490d210000000000000081146112c1577728c87cb5c89a2571ebfdcb54864ada834a0000000000000081146112d257780197d4df19d605767337e9f14d3eec8920e40000000000000081146112e357780fee50b7025c36a0802f236d04753d5b48e80000000000000081146112f457789f4f2726179a224501d762422c946590d9100000000000000081146113055779063917877cec0556b21269d695bdcbf7a87aa000000000000000811461131657793e3aeb4ae1383562f4b82261d969f7ac94ca40000000000000008114611327577a026e4d30eccc3215dd8f3157d27e23acbdcfe680000000000000008114611338577a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008114611349577af316271c7fc3908a8bef464e3945ef7a25360a0000000000000000811461135a577b097edd871cfda3a5697758bf0e3cbb5ac5741c640000000000000000811461136b577b5ef4a74721e864761ea977768e5f518bb6891be80000000000000000811461137c577c03b58e88c75313ec9d329eaaa18fb92f75215b17100000000000000000811461138d577c25179157c93ec73e23fa32aa4f9d3bda934d8ee6a00000000000000000811461139e577d0172ebad6ddc73c86d67c5faa71c245689c107950240000000000000000081146113af577d0e7d34c64a9c85d4460dbbca87196b61618a4bd21680000000000000000081146113c0577d90e40fbeea1d3a4abc8955e946fe31cdcf66f634e100000000000000000081146113d1577e05a8e89d75252446eb5d5d5b1cc5edf20a1a059e10ca00000000000000000081146113e2577e3899162693736ac531a5a58f1fbb4b746504382ca7e400000000000000000081146113f3577f0235fadd81c2822bb3f07877973d50f28bf22a31be8ee80000000000000000008114611404577f161bcca7119915b50764b4abe86529797775a5f17195100000000000000000008114611415577fdd15fe86affad91249ef0eb713f39ebeaa987b6e6fd2a00000000000000000008114611426576000199150611433565b67f9ccd8a1c507ffff199150611433565b67ebec21ee1da3ffff199150611433565b67de0b6b3a763fffff199150611433565b67d02ab486cedbffff199150611433565b67c249fdd32777ffff199150611433565b67b469471f8013ffff199150611433565b67a688906bd8afffff199150611433565b6798a7d9b8314bffff199150611433565b678ac7230489e7ffff199150611433565b677ce66c50e283ffff199150611433565b676f05b59d3b1fffff199150611433565b676124fee993bbffff199150611433565b6753444835ec57ffff199150611433565b674563918244f3ffff199150611433565b673782dace9d8fffff199150611433565b6729a2241af62bffff199150611433565b671bc16d674ec7ffff199150611433565b670de0b6b3a763ffff199150611433565b60009150611433565b670de0b6b3a76400009150611433565b671bc16d674ec800009150611433565b6729a2241af62c00009150611433565b673782dace9d9000009150611433565b674563918244f400009150611433565b6753444835ec5800009150611433565b676124fee993bc00009150611433565b676f05b59d3b2000009150611433565b677ce66c50e28400009150611433565b678ac7230489e800009150611433565b6798a7d9b8314c00009150611433565b67a688906bd8b000009150611433565b67b469471f801400009150611433565b67c249fdd3277800009150611433565b67d02ab486cedc00009150611433565b67de0b6b3a764000009150611433565b67ebec21ee1da400009150611433565b67f9ccd8a1c50800009150611433565b680107ad8f556c6c00009150611433565b6801158e460913d000009150611433565b6801236efcbcbb3400009150611433565b6801314fb370629800009150611433565b68013f306a2409fc00009150611433565b68014d1120d7b16000009150611433565b68015af1d78b58c400009150611433565b680168d28e3f002800009150611433565b680176b344f2a78c00009150611433565b68018493fba64ef000009150611433565b68019274b259f65400009150611433565b6801a055690d9db800009150611433565b6801ae361fc1451c00009150611433565b6801bc16d674ec8000009150611433565b6801c9f78d2893e400009150611433565b6801d7d843dc3b4800009150611433565b6801e5b8fa8fe2ac00009150611433565b6801f399b1438a1000009150611433565b6802017a67f7317400009150611433565b68020f5b1eaad8d800009150611433565b68021d3bd55e803c00009150611433565b68022b1c8c1227a000009150611433565b680238fd42c5cf0400009150611433565b680246ddf979766800009150611433565b680254beb02d1dcc00009150611433565b6802629f66e0c53000009150611433565b680270801d946c9400009150611433565b68027e60d44813f800009150611433565b68028c418afbbb5c00009150611433565b68029a2241af62c000009150611433565b6802a802f8630a2400009150611433565b6802b5e3af16b18800009150611433565b6802c3c465ca58ec00009150611433565b6802d1a51c7e005000009150611433565b6802df85d331a7b400009150611433565b6802ed6689e54f1800009150611433565b6802fb474098f67c00009150611433565b68030927f74c9de000009150611433565b68031708ae00454400009150611433565b680324e964b3eca800009150611433565b680332ca1b67940c000091505b50600019810361145857672e19dc008126bf2b670de0b6b3a7640000610425846104c7565b919050565b6000600160801b821061147d57608091821c9161147a9082611fa8565b90505b6801000000000000000082106114a057604091821c9161149d9082611fa8565b90505b64010000000082106114bf57602091821c916114bc9082611fa8565b90505b6201000082106114dc57601091821c916114d99082611fa8565b90505b61010082106114f857600891821c916114f59082611fa8565b90505b6010821061151357600491821c916115109082611fa8565b90505b6004821061152e57600291821c9161152b9082611fa8565b90505b6002821061145857610319600182611fa8565b60008160000361155357506000919050565b50600181600160801b811061156d5760409190911b9060801c5b6801000000000000000081106115885760209190911b9060401c5b640100000000811061159f5760109190911b9060201c5b6201000081106115b45760089190911b9060101c5b61010081106115c85760049190911b9060081c5b601081106115db5760029190911b9060041c5b600881106115eb57600182901b91505b60018284816115fc576115fc611f92565b048301901c9150600182848161161457611614611f92565b048301901c9150600182848161162c5761162c611f92565b048301901c9150600182848161164457611644611f92565b048301901c9150600182848161165c5761165c611f92565b048301901c9150600182848161167457611674611f92565b048301901c9150600182848161168c5761168c611f92565b048301901c915060008284816116a4576116a4611f92565b0490508083101561032b5782610656565b60008080600019848609848602925082811083820303915050670de0b6b3a764000081106116f95760405163698d9a0160e11b8152600481018290526024016104a7565b600080670de0b6b3a764000086880991506706f05b59d3b1ffff82119050826000036117375780670de0b6b3a7640000850401945050505050610319565b620400008285030493909111909103600160ee1b02919091177faccb18165bd6fe31ae1cf318dc5b51eee0e1ba569b88cd74c1773b91fac106690201905092915050565b60008080600019858709858702925082811083820303915050806000036117b5578382816117ab576117ab611f92565b049250505061032b565b8381106117df57604051631dcf306360e21b815260048101829052602481018590526044016104a7565b600084868809600260036001881981018916988990049182028318808302840302808302840302808302840302808302840302808302840302918202909203026000889003889004909101858311909403939093029303949094049190911702949350505050565b7780000000000000000000000000000000000000000000000067800000000000000082161561187f5768016a09e667f3bcc9090260401c5b67400000000000000082161561189e576801306fe0a31b7152df0260401c5b6720000000000000008216156118bd576801172b83c7d517adce0260401c5b6710000000000000008216156118dc5768010b5586cf9890f62a0260401c5b6708000000000000008216156118fb576801059b0d31585743ae0260401c5b67040000000000000082161561191a57680102c9a3e778060ee70260401c5b6702000000000000008216156119395768010163da9fb33356d80260401c5b67010000000000000082161561195857680100b1afa5abcbed610260401c5b66800000000000008216156119765768010058c86da1c09ea20260401c5b6640000000000000821615611994576801002c605e2e8cec500260401c5b66200000000000008216156119b257680100162f3904051fa10260401c5b66100000000000008216156119d0576801000b175effdc76ba0260401c5b66080000000000008216156119ee57680100058ba01fb9f96d0260401c5b6604000000000000821615611a0c5768010002c5cc37da94920260401c5b6602000000000000821615611a2a576801000162e525ee05470260401c5b6601000000000000821615611a485768010000b17255775c040260401c5b65800000000000821615611a65576801000058b91b5bc9ae0260401c5b65400000000000821615611a8257680100002c5c89d5ec6d0260401c5b65200000000000821615611a9f5768010000162e43f4f8310260401c5b65100000000000821615611abc57680100000b1721bcfc9a0260401c5b65080000000000821615611ad95768010000058b90cf1e6e0260401c5b65040000000000821615611af6576801000002c5c863b73f0260401c5b65020000000000821615611b1357680100000162e430e5a20260401c5b65010000000000821615611b30576801000000b1721835510260401c5b648000000000821615611b4c57680100000058b90c0b490260401c5b644000000000821615611b685768010000002c5c8601cc0260401c5b642000000000821615611b84576801000000162e42fff00260401c5b641000000000821615611ba05768010000000b17217fbb0260401c5b640800000000821615611bbc576801000000058b90bfce0260401c5b640400000000821615611bd857680100000002c5c85fe30260401c5b640200000000821615611bf45768010000000162e42ff10260401c5b640100000000821615611c1057680100000000b17217f80260401c5b6380000000821615611c2b5768010000000058b90bfc0260401c5b6340000000821615611c46576801000000002c5c85fe0260401c5b6320000000821615611c6157680100000000162e42ff0260401c5b6310000000821615611c7c576801000000000b17217f0260401c5b6308000000821615611c9757680100000000058b90c00260401c5b6304000000821615611cb25768010000000002c5c8600260401c5b6302000000821615611ccd576801000000000162e4300260401c5b6301000000821615611ce85768010000000000b172180260401c5b62800000821615611d02576801000000000058b90c0260401c5b62400000821615611d1c57680100000000002c5c860260401c5b62200000821615611d365768010000000000162e430260401c5b62100000821615611d5057680100000000000b17210260401c5b62080000821615611d6a5768010000000000058b910260401c5b62040000821615611d84576801000000000002c5c80260401c5b62020000821615611d9e57680100000000000162e40260401c5b62010000821615611db8576801000000000000b1720260401c5b618000821615611dd157680100000000000058b90260401c5b614000821615611dea5768010000000000002c5d0260401c5b612000821615611e03576801000000000000162e0260401c5b611000821615611e1c5768010000000000000b170260401c5b610800821615611e35576801000000000000058c0260401c5b610400821615611e4e57680100000000000002c60260401c5b610200821615611e6757680100000000000001630260401c5b610100821615611e8057680100000000000000b10260401c5b6080821615611e9857680100000000000000590260401c5b6040821615611eb0576801000000000000002c0260401c5b6020821615611ec857680100000000000000160260401c5b6010821615611ee0576801000000000000000b0260401c5b6008821615611ef857680100000000000000060260401c5b6004821615611f1057680100000000000000030260401c5b6002821615611f2857680100000000000000010260401c5b6001821615611f4057680100000000000000010260401c5b670de0b6b3a76400000260409190911c60bf031c90565b600060208284031215611f6957600080fd5b5035919050565b60008060408385031215611f8357600080fd5b50508035926020909101359150565b634e487b7160e01b600052601260045260246000fd5b60008219821115611fc957634e487b7160e01b600052601160045260246000fd5b50019056fea164736f6c634300080d000a";

type SafePRBMathTesterConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (xs: SafePRBMathTesterConstructorParams): xs is ConstructorParameters<typeof ContractFactory> =>
  xs.length > 1;

export class SafePRBMathTester__factory extends ContractFactory {
  constructor(...args: SafePRBMathTesterConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<SafePRBMathTester> {
    return super.deploy(overrides || {}) as Promise<SafePRBMathTester>;
  }
  override getDeployTransaction(overrides?: Overrides & { from?: PromiseOrValue<string> }): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): SafePRBMathTester {
    return super.attach(address) as SafePRBMathTester;
  }
  override connect(signer: Signer): SafePRBMathTester__factory {
    return super.connect(signer) as SafePRBMathTester__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SafePRBMathTesterInterface {
    return new utils.Interface(_abi) as SafePRBMathTesterInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): SafePRBMathTester {
    return new Contract(address, _abi, signerOrProvider) as SafePRBMathTester;
  }
}