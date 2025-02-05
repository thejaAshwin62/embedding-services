const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <span className="loading loading-ball loading-xs"></span>
          <span className="loading loading-ball loading-sm"></span>
          <span className="loading loading-ball loading-md"></span>
          <span className="loading loading-ball loading-lg"></span>
        </div>
        <p className="text-gray-600 animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 