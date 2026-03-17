import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-3">
              <img
                src="/TasteLocal_logo.png"
                alt="TasteLocal Logo"
                className="h-11 w-auto object-contain"
              />
              <span className="font-display text-xl font-bold text-white">TasteLocal</span>
            </Link>

            <p className="mb-4 text-sm text-gray-400">
              Discover authentic local food experiences in Singapore. From hawker centres to
              cooking classes, taste the real flavour of the Lion City.
            </p>

            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-primary-600"
              >
                <FiFacebook size={16} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-primary-600"
              >
                <FiInstagram size={16} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-primary-600"
              >
                <FiTwitter size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg font-semibold text-white">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/experiences" className="transition-colors hover:text-primary-400">
                  Food Experiences
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="transition-colors hover:text-primary-400">
                  Local Vendors
                </Link>
              </li>
              <li>
                <Link to="/map" className="transition-colors hover:text-primary-400">
                  Food Map
                </Link>
              </li>
              <li>
                <Link to="/blog" className="transition-colors hover:text-primary-400">
                  Food Blog
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition-colors hover:text-primary-400">
                  Become a Vendor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/page/about" className="transition-colors hover:text-primary-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/page/contact" className="transition-colors hover:text-primary-400">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/page/privacy" className="transition-colors hover:text-primary-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/page/terms" className="transition-colors hover:text-primary-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/page/faq" className="transition-colors hover:text-primary-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/page/sitemap" className="transition-colors hover:text-primary-400">
                  Site Map
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg font-semibold text-white">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FiMapPin size={16} className="mt-0.5 shrink-0 text-primary-400" />
                <span>
                  1 Orchard Road, #10-01
                  <br />
                  Singapore 238824
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FiMail size={16} className="shrink-0 text-primary-400" />
                <a href="mailto:tastelocal2@gmail.com" className="hover:text-primary-400">
                  tastelocal2@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={16} className="shrink-0 text-primary-400" />
                <span>+65 6100 8888</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 md:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} TasteLocal Tourism Board. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Capstone Project — Professional Diploma in Full Stack Web Development
          </p>
        </div>
      </div>
    </footer>
  );
}