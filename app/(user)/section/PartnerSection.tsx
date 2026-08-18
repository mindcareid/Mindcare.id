"use client";

import { motion, Variants } from "framer-motion";
import LogoMarquee from "../components/Marque";
import { FiAward, FiTrendingUp, FiUsers, FiGlobe } from "react-icons/fi";

export default function PartnerSection() {
  const stats = [
    {
      icon: FiGlobe,
      value: "50+",
      label: "Global Partners",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FiAward,
      value: "100+",
      label: "Certifications",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FiUsers,
      value: "10K+",
      label: "Trained Professionals",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: FiTrendingUp,
      value: "95%",
      label: "Success Rate",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="relative bg-linear-to-b from-white via-gray-50 to-white py-20 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-linear-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
          >
            Collaborating with{" "}
            <span className="bg-linear-to-r from-red-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
              Global Leaders
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Partnering with global tech principals to deliver the best HR
            solutions
          </motion.p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.03 }}
              className="relative bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex p-3 md:p-4 bg-linear-to-br ${stat.color} rounded-xl md:rounded-2xl mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  <stat.icon className="text-white text-2xl md:text-3xl" />
                </motion.div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm md:text-base text-gray-600 font-medium">
                  {stat.label}
                </p>
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-linear-to-br from-gray-100 to-transparent rounded-full opacity-50" />
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-gray-300 to-transparent" />
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Our Partners
            </span>
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-gray-300 to-transparent" />
          </div>
          <div className="relative bg-white/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50">
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-linear-to-r from-white to-transparent  pointer-events-none rounded-l-3xl" />
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-linear-to-l from-white to-transparent  pointer-events-none rounded-r-3xl" />

            <LogoMarquee />
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
