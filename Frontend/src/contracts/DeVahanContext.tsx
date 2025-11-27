import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import Web3Modal from 'web3modal';
import { Contract, ethers } from 'ethers';
import ABI from './DeVahanABI.json';
import { Contract_Address } from './contractAddress';

const CONTRACT_ADDRESS = Contract_Address;

type BigNumberish = ethers.BigNumberish;

interface NFTContextType {
  currentAccount: string;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => Promise<void>;
  mint: (to: string, tokenURI_: string) => Promise<string>;
  addServiceRecord: (tokenId: BigNumberish, json: string) => Promise<string>;
  tokenURI: (tokenId: BigNumberish) => Promise<string>;
  getServiceRecordCount: (tokenId: BigNumberish) => Promise<ethers.BigNumberish>;
  getServiceRecordAt: (tokenId: BigNumberish, index: BigNumberish) => Promise<string>;
}

export const NFTContext = createContext<NFTContextType | undefined>(undefined);

export const NFTProvider = ({ children }: { children: ReactNode }) => {
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [web3Modal, setWeb3Modal] = useState<Web3Modal | null>(null);

  // ---------- Network config (Polygon Amoy) ----------
  const AMOY_CHAIN_ID = '0x13882'; // hex chain id
  const AMOY_NETWORK_CONFIG = {
    chainId: AMOY_CHAIN_ID,
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    blockExplorerUrls: ['https://www.oklink.com/amoy'],
  };

  // Read-only provider for view calls
  const readOnlyProvider = new ethers.JsonRpcProvider(
    AMOY_NETWORK_CONFIG.rpcUrls[0]
  );

  // ---------- helpers to create contract instances ----------
  const buildContractWithSigner = (s: ethers.Signer) =>
    new Contract(CONTRACT_ADDRESS, ABI.abi ?? ABI, s);

  const buildReadOnlyContract = () =>
    new Contract(CONTRACT_ADDRESS, ABI.abi ?? ABI, readOnlyProvider);

  // ---------- initialize Web3Modal (client side) ----------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const providerOptions = {}; // add options if you need (WalletConnect, etc.)
    const modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
    });
    setWeb3Modal(modal);
  }, []);

  // If cached provider exists, attempt auto-connect
  useEffect(() => {
    if (!web3Modal) return;
    if (web3Modal.cachedProvider) {
      connectWallet().catch((e) => {
        console.warn('Auto-connect failed:', e?.message ?? e);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Modal]);

  // ---------- connect wallet ----------
  const connectWallet = async (): Promise<string> => {
    console.log('Connecting wallet...');
    if (typeof window === 'undefined') throw new Error('Window not available');
    console.log('Web3Modal instance:', web3Modal);
    if (!web3Modal) throw new Error('Web3Modal not initialized');
    console.log('Opening Web3Modal...');
    // open modal & get provider (e.g. window.ethereum)
    const rawProvider: any = await web3Modal.connect();
    console.log('Raw provider:', rawProvider);
    // Attempt to switch to Amoy, if missing, try adding
    try {
      await rawProvider.request?.({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AMOY_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError?.code === 4902) {
        // chain not added; try adding
        try {
          await rawProvider.request?.({
            method: 'wallet_addEthereumChain',
            params: [AMOY_NETWORK_CONFIG],
          });
        } catch (addErr) {
          console.warn('Failed to add Amoy network to wallet', addErr);
          // we continue — the provider may still work but on wrong chain
        }
      } else {
        console.warn('Failed to switch network', switchError);
      }
    }

    // ethers v6: BrowserProvider wraps the raw provider
    const browserProvider = new ethers.BrowserProvider(rawProvider);

    // getSigner is async in ethers v6
    const signerLocal = await browserProvider.getSigner();
    const address = await signerLocal.getAddress();

    setSigner(signerLocal);
    setCurrentAccount(address);

    // contract with signer for writes
    const userContract = buildContractWithSigner(signerLocal);
    setContract(userContract);

    // set up provider event listeners
    if (rawProvider && rawProvider.on) {
      rawProvider.on('accountsChanged', (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
          // disconnected
          setCurrentAccount('');
          setSigner(null);
          setContract(null);
          web3Modal?.clearCachedProvider();
        } else {
          setCurrentAccount(accounts[0]);
        }
      });

      rawProvider.on('chainChanged', (chainId: string) => {
        console.info('chain changed to', chainId);
        // if needed: force refresh or clear signer/contract
        // We'll keep the UI logic minimal; reads use readOnlyProvider
      });

      rawProvider.on('disconnect', (code: number, reason: string) => {
        console.info('provider disconnected', code, reason);
        setCurrentAccount('');
        setSigner(null);
        setContract(null);
        web3Modal?.clearCachedProvider();
      });
    }

    return address;
  };

  // ---------- disconnect ----------
  const disconnectWallet = async (): Promise<void> => {
    try {
      await web3Modal?.clearCachedProvider();
    } catch (e) {
      console.warn('Failed to clear cached provider', e);
    } finally {
      setCurrentAccount('');
      setSigner(null);
      setContract(null);
    }
  };

  // ---------- safe guard to ensure contract available for write ----------
  const ensureWriteContract = (): Contract => {
    if (!contract) throw new Error('Wallet not connected — please connect your wallet first.');
    return contract;
  };

  // ---------- write actions ----------
  // Option A: mint(address to, string tokenURI)
  const mint = async (to: string, tokenURI_: string): Promise<string> => {
    try {
      const c = ensureWriteContract();
      const tx = await c.mint(to, tokenURI_);
      // ethers v6 TransactionResponse has wait()
      const receipt = await tx.wait();
      return receipt.transactionHash ?? tx.hash ?? '';
    } catch (e: any) {
      // surface helpful error messages for common cases
      const msg = e?.data?.message || e?.message || String(e);
      throw new Error(`Mint failed: ${msg}`);
    }
  };

  const addServiceRecord = async (tokenId: BigNumberish, json: string): Promise<string> => {
    try {
      const c = ensureWriteContract();
      const tx = await c.addServiceRecord(tokenId, json);
      const receipt = await tx.wait();
      return receipt.transactionHash ?? tx.hash ?? '';
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || String(e);
      throw new Error(`addServiceRecord failed: ${msg}`);
    }
  };

  // ---------- read-only actions (always use read-only provider) ----------
  const tokenURI = async (tokenId: BigNumberish): Promise<string> => {
    try {
      const read = buildReadOnlyContract();
      return await read.tokenURI(tokenId);
    } catch (e: any) {
      const msg = e?.message || String(e);
      throw new Error(`tokenURI read failed: ${msg}`);
    }
  };

  const getServiceRecordCount = async (tokenId: BigNumberish): Promise<ethers.BigNumberish> => {
    try {
      const read = buildReadOnlyContract();
      return await read.getServiceRecordCount(tokenId);
    } catch (e: any) {
      const msg = e?.message || String(e);
      throw new Error(`getServiceRecordCount failed: ${msg}`);
    }
  };

  const getServiceRecordAt = async (tokenId: BigNumberish, index: BigNumberish): Promise<string> => {
    try {
      const read = buildReadOnlyContract();
      return await read.getServiceRecordAt(tokenId, index);
    } catch (e: any) {
      const msg = e?.message || String(e);
      throw new Error(`getServiceRecordAt failed: ${msg}`);
    }
  };

  // ---------- context provider ----------
  return (
    <NFTContext.Provider
      value={{
        currentAccount,
        connectWallet,
        disconnectWallet,
        mint,
        addServiceRecord,
        tokenURI,
        getServiceRecordCount,
        getServiceRecordAt,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};

// handy hook
export const useNFT = () => {
  const context = useContext(NFTContext);
  if (!context) throw new Error('useNFT must be used within an NFTProvider');
  return context;
};
