import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Target, Zap, Users, Star, GitBranch, Trophy, Users as UsersGroup } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  const values = [
    { icon: Zap, title: t('about.values.v1.title'), description: t('about.values.v1.desc') },
    { icon: Target, title: t('about.values.v2.title'), description: t('about.values.v2.desc') },
    { icon: Users, title: t('about.values.v3.title'), description: t('about.values.v3.desc') },
  ];

  const team = [
    { name: t('about.team.member1.name'), role: t('about.team.member1.role'), image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&q=80" },
    { name: t('about.team.member2.name'), role: t('about.team.member2.role'), image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80" },
    { name: t('about.team.member3.name'), role: t('about.team.member3.role'), image: "https://images.unsplash.com/photo-1557862921-37829c790f19?w=200&h=200&fit=crop&q=80" },
  ];

  const history = [
    { year: 2021, title: t('about.history.year1.title'), description: t('about.history.year1.desc'), icon: GitBranch },
    { year: 2022, title: t('about.history.year2.title'), description: t('about.history.year2.desc'), icon: Zap },
    { year: 2023, title: t('about.history.year3.title'), description: t('about.history.year3.desc'), icon: Trophy },
    { year: 2024, title: t('about.history.year4.title'), description: t('about.history.year4.desc'), icon: UsersGroup },
  ];

  const testimonials = [
    { quote: t('about.testimonials.t1'), name: 'Laura D.' },
    { quote: t('about.testimonials.t2'), name: 'Marc P.' },
    { quote: t('about.testimonials.t3'), name: 'Kevin R.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-german-black via-german-red to-gray-900 text-white py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-6xl font-bold mb-4">{t('about.title')}</motion.h1>
          <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">{t('about.subtitle')}</motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.mission.title')}</h2>
              <p className="text-lg text-gray-600 mb-6">{t('about.mission.desc')}</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.experience.title')}</h2>
              <p className="text-lg text-gray-600">{t('about.experience.desc')}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&h=400&fit=crop&q=80" alt={t('about.team.title')} className="rounded-2xl shadow-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('about.history.title')}</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 h-full w-0.5 bg-gray-200 hidden md:block"></div>
            {history.map((item, index) => (
              <div key={index} className={`flex md:items-center mb-12 ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                <div className="hidden md:flex w-1/2"></div>
                <div className="hidden md:flex justify-center w-12">
                  <div className="w-8 h-8 bg-german-red rounded-full flex items-center justify-center text-white">
                    <item.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg">
                  <p className="text-german-red font-bold text-xl mb-2">{item.year}</p>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('about.testimonials.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-gray-50 p-8 rounded-2xl">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" className="w-5 h-5" />)}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                <p className="font-bold text-gray-800">- {testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('about.values.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center p-8 bg-white rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-german-red" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('about.team.title')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
                <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg object-cover" />
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-german-red">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
