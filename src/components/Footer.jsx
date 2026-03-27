export default function Footer() {
  return (
    <footer className="border-t border-dark-800 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-dark-500 text-sm">
          © {new Date().getFullYear()} VoidMail
        </p>
      </div>
    </footer>
  );
}
