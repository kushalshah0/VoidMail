export default function Footer() {
  return (
    <footer className="border-t border-light-300 dark:border-dark-800 py-6 mt-auto
                        transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-light-600 dark:text-dark-400 text-sm">
          © {new Date().getFullYear()} VoidMail
        </p>
      </div>
    </footer>
  );
}
