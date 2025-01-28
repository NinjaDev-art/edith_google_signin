import React, { useState } from 'react';

const TweetModal = ({ closeModal, handleTweet }: { closeModal: () => void, handleTweet: (username: string) => void }) => {
  const [twitterUsername, setTwitterUsername] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    // Regular expression to match a valid Twitter username or URL
    const usernamePattern = /^@(\w){1,15}$|^(https:\/\/x\.com\/\w{1,15})$/;

    if (!twitterUsername) {
      setError('Username cannot be empty.');
      return;
    }

    if (!usernamePattern.test(twitterUsername)) {
      setError('Invalid username format. Please use @username or https://x.com/username');
      return;
    }

    setError(''); // Clear any previous error
    handleTweet(twitterUsername);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#101010] p-6 rounded-xl shadow-lg w-80">
        <h2 className="text-lg font-medium text-[#FCFCFC] mb-4">Twitter Username</h2>
        <p className="text-sm text-[#878787] mb-4">Please input your Twitter username:</p>
        <input
          type="text"
          value={twitterUsername}
          onChange={(e) => setTwitterUsername(e.target.value)}
          className="w-full p-2 mb-4 border border-[#262626] rounded bg-[#010101] text-[#FCFCFC] focus:outline-none"
          placeholder="@username OR https://x.com/username"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-[#FFFFFF1F] text-[#FCFCFC] rounded hover:bg-[#FFFFFF] hover:text-[#010101] transition-colors duration-200"
          >
            Close
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-[#FFFFFF] text-[#010101] rounded hover:bg-[#FFFFFF1F] hover:text-[#FCFCFC] transition-colors duration-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TweetModal;