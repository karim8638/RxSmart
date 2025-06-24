import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t py-4">
      <div className="container mx-auto px-6">
        <div className="text-center text-sm text-gray-600">
          <p>© {currentYear} Powered by <span className="font-semibold text-blue-600">KarimTech</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;