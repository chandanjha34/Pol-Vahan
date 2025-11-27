import React, { useState, useContext } from 'react';
import { X, Shield, User, Building2, Wrench } from 'lucide-react';
import { NFTContext } from '../contracts/DeVahanContext';
import { useDispatch, useSelector } from 'react-redux';
import { assignAddress } from '../Redux/features/wallet';
import { RootState, AppDispatch } from '../Redux/store';
import { metamaskConnect } from '../contracts/walletConnect';
import { assignEmail } from '../Redux/features/emails';
import { assignUser } from '../Redux/features/users';
import { loginSuccess } from '../Redux/features/auth';

interface AuthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  metaMaskAddress: string;
  onMetaMaskConnect: (address: string) => void;
  onSignIn: (data: {
    email: string;
    password: string;
    isDealer: boolean;
    isSignIn: boolean;
  }) => void;
}

function AuthenticationModal({
  isOpen,
  onClose,
  metaMaskAddress,
  onMetaMaskConnect,
  onSignIn,
}: AuthenticationModalProps) {
  const [role, setRole] = useState<'user' | 'dealer' | 'service'>('user');
  const [isSignIn, setIsSignIn] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const walletAddress = useSelector((state: RootState) => state.wallet.value);
  const nftcontext = useContext(NFTContext);
  if (!nftcontext) return <p>Error loading NFT context.</p>;
    const { connectWallet } = nftcontext;
  const connect = async () => {
    try {
      const wallet = await connectWallet();
      console.log('Connected wallet:', wallet);
      if (wallet && typeof wallet === 'string') {
        dispatch(assignAddress(wallet));
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let payload: any = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    if (!isSignIn) {
      payload.name = formData.get('name');
      if (role === 'dealer') payload.Dealer_ID = formData.get('Dealer_ID');
      if (role === 'service') payload.Service_ID = formData.get('Service_ID');
    }

    try {
      const baseUrl = 'https://og-devahan-2.onrender.com/auth';
      const endpoint = `${baseUrl}/${role === 'user' ? 'customer' : role}/${
        isSignIn ? 'login' : 'signup'
      }`;
      console.log(endpoint, payload);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log(res)
      const data = await res.json();
      if (res.ok) {
        dispatch(assignEmail(data.email));
        dispatch(assignUser(data.name));
        dispatch(loginSuccess({
          name: data.name,
          email: data.email,
          role,
          token: data.token,
        }));
        alert(`Success: ${data.message || 'Logged in successfully!'}`);
        onClose();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-yellow-300 p-8 rounded-2xl shadow-lg w-full max-w-md relative border border-yellow-400">
        <button onClick={onClose} className="absolute top-4 right-4 text-yellow-400 hover:text-yellow-200">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">Authentication Portal</h2>

        {/* Role Selection */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setRole('user')}
            className={`px-4 py-2 rounded-lg font-semibold ${role === 'user' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-yellow-400 border border-yellow-500'}`}
          >
            <User className="inline-block w-4 h-4 mr-1" /> User
          </button>
          <button
            onClick={() => setRole('dealer')}
            className={`px-4 py-2 rounded-lg font-semibold ${role === 'dealer' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-yellow-400 border border-yellow-500'}`}
          >
            <Building2 className="inline-block w-4 h-4 mr-1" /> Dealer
          </button>
          <button
            onClick={() => setRole('service')}
            className={`px-4 py-2 rounded-lg font-semibold ${role === 'service' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-yellow-400 border border-yellow-500'}`}
          >
            <Wrench className="inline-block w-4 h-4 mr-1" /> Service Center
          </button>
        </div>

        {/* Sign In / Sign Up */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setIsSignIn(true)}
            className={`px-4 py-2 rounded-lg ${isSignIn ? 'bg-yellow-400 text-gray-900 font-semibold' : 'bg-gray-800 text-yellow-400 border border-yellow-500'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignIn(false)}
            className={`px-4 py-2 rounded-lg ${!isSignIn ? 'bg-yellow-400 text-gray-900 font-semibold' : 'bg-gray-800 text-yellow-400 border border-yellow-500'}`}
          >
            Sign Up
          </button>
        </div>

        <button
          onClick={connect}
          className="mb-6 w-full px-6 py-3 rounded-xl font-semibold text-gray-800 bg-gradient-to-r from-yellow-400 to-yellow-300"
        >
          {walletAddress ? `Connected: ${walletAddress.slice(0, 9)}...` : 'Connect Wallet'}
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isSignIn && (
            <>
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input type="text" name="name" className="w-full p-2 rounded bg-gray-800 text-yellow-300 border border-yellow-400" required />
              </div>

              {role === 'dealer' && (
                <div>
                  <label className="block text-sm mb-1">Dealer ID</label>
                  <input type="text" name="Dealer_ID" className="w-full p-2 rounded bg-gray-800 text-yellow-300 border border-yellow-400" required />
                </div>
              )}

              {role === 'service' && (
                <div>
                  <label className="block text-sm mb-1">Service Center ID</label>
                  <input type="text" name="Service_ID" className="w-full p-2 rounded bg-gray-800 text-yellow-300 border border-yellow-400" required />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" name="email" className="w-full p-2 rounded bg-gray-800 text-yellow-300 border border-yellow-400" required />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" name="password" className="w-full p-2 rounded bg-gray-800 text-yellow-300 border border-yellow-400" required />
          </div>

          <button type="submit" className="w-full bg-yellow-400 text-gray-900 font-semibold py-3 rounded-xl hover:bg-yellow-300 transition-colors">
            <Shield className="w-4 h-4 mr-2 inline" />
            {isSignIn ? 'Sign In' : role === 'dealer' ? 'Register as Dealer' : role === 'service' ? 'Register Service Center' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthenticationModal;
