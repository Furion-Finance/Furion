// Get token address on mainnet

export const getTokenAddressOnMainnet = (name: string): string => {
  switch (name) {
    case "USDT":
      return "0xdAC17F958D2ee523a2206206994597C13D831ec7";

    case "WETH":
      return "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    default:
      return "";
  }
};
