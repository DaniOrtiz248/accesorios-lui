'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX, FiShoppingBag, FiInstagram } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-background-light shadow-md sticky top-0 z-50 border-b border-primary-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <FiShoppingBag className="text-primary-400 text-2xl" />
            <div className="flex flex-col leading-tight">
              <span className="text-lg md:text-xl font-bold text-primary-900 tracking-wide">Luisa Ramirez</span>
              <span className="text-xs md:text-sm font-light text-primary-600 -mt-1">Accesorios</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-primary-700 hover:text-primary-400 transition font-medium">
              Inicio
            </Link>
            <Link href="/productos" className="text-primary-700 hover:text-primary-400 transition font-medium">
              Productos
            </Link>
            <div className="flex items-center space-x-4 ml-4">
              <a
                href="https://wa.me/573104426397"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 transition"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-2xl" />
              </a>
              <a
                href="https://www.instagram.com/accesorioslui07/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-500 transition"
                aria-label="Instagram"
              >
                <FiInstagram className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary-900"
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="text-primary-800 hover:text-primary-400 hover:bg-primary-50 px-2 py-2 rounded-lg transition-all duration-200 transform hover:translate-x-1 font-medium"
              >
                Inicio
              </Link>
              <Link
                href="/productos"
                onClick={() => setIsOpen(false)}
                className="text-primary-800 hover:text-primary-400 hover:bg-primary-50 px-2 py-2 rounded-lg transition-all duration-200 transform hover:translate-x-1 font-medium"
              >
                Productos
              </Link>
              <div className="flex items-center space-x-4 pt-2 px-2">
                <a
                  href="https://wa.me/573104426397"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 hover:scale-110 transition-transform duration-200"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="text-2xl" />
                </a>
                <a
                  href="https://www.instagram.com/accesorioslui07/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-500 hover:scale-110 transition-transform duration-200"
                  aria-label="Instagram"
                >
                  <FiInstagram className="text-2xl" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
