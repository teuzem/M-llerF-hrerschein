import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bike, Car, Truck, Bus, Tractor } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LicenseGallerySection = () => {
  const { t } = useTranslation();
  const licenses = [
    {
      name: t('home.gallery.license_A', 'Permis Moto (A)'),
      icon: Bike,
      img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop&q=80',
    },
    {
      name: t('home.gallery.license_B', 'Permis Auto (B)'),
      icon: Car,
      img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&q=80',
    },
    {
      name: t('home.gallery.license_C', 'Permis Poids Lourd (C)'),
      icon: Truck,
      img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=300&fit=crop&q=80',
    },
    {
      name: t('home.gallery.license_D', 'Permis Bus (D)'),
      icon: Bus,
      img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop&q=80',
    },
    {
      name: t('home.gallery.license_T', 'Permis Tracteur (T)'),
      icon: Tractor,
      img: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=400&h=300&fit=crop&q=80',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900">
            {t('home.gallery.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.gallery.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {licenses.map((license, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative rounded-2xl overflow-hidden shadow-xl group"
            >
              <img src={license.img} alt={license.name} className="w-full h-80 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <license.icon className="w-8 h-8 mb-2" />
                <h3 className="text-2xl font-bold">{license.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/services" className="inline-flex items-center px-8 py-3 bg-german-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
            {t('common.view_more')} <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LicenseGallerySection;
