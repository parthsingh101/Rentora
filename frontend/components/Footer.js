const Footer = () => {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start text-center md:text-left">
            <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-500">
              Rentora
            </span>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Streamlining rental management for everyone.
            </p>
          </div>
          <div className="flex items-center space-x-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#" className="hover:text-blue-600">About</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Privacy</a>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Rentora. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
