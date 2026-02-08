'use client';

import { FiInstagram } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-background-light mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Accesorios LUI</h3>
            <p className="text-primary-100">
              Los mejores accesorios para ti. Anillos, collares, pulseras, bolsos y más.
            </p>
          </div>

          {/* Dirección */}
          <div>
            <h3 className="text-xl font-bold mb-4">Visítanos</h3>
            <p className="text-primary-100">
              Mz 2 Casa 4, 1° piso<br />
              Barrio Bello Horizonte<br />
              Pereira, Cuba
            </p>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-primary-100 hover:text-accent-light transition">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/productos" className="text-primary-100 hover:text-accent-light transition">
                  Productos
                </a>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div>
            <h3 className="text-xl font-bold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="https://wa.me/573104426397"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-3xl" />
              </a>
              <a
                href="https://www.instagram.com/accesorioslui07/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-light hover:text-accent transition"
                aria-label="Instagram"
              >
                <FiInstagram className="text-3xl" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-6 text-center text-primary-200">
          <p>&copy; {new Date().getFullYear()} Accesorios LUI. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
