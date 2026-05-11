const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default LoadingSpinner;