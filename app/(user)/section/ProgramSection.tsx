"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { categories, programs } from "../programs/data/data";
import { FaClock, FaStar, FaUserFriends } from "react-icons/fa";
import { FaChartSimple } from "react-icons/fa6";
import { MdArrowForwardIos } from "react-icons/md";

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.2 },
  },
};

const listVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function ProgramSectionPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Programming");
  const [isSticky, setIsSticky] = useState(false);

  // Detect scroll for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredPrograms = programs.filter(
    (program) => program.category === selectedCategory,
  );

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("id-ID").format(value);

  return (
    <section className="bg-linear-to-b from-white to-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Our{" "}
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Training Programs
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose from our wide range of professional development courses
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-all duration-300 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-8 ${
            isSticky ? "shadow-lg" : ""
          }`}
        >
          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 py-4">
              {categories.map((cat) => {
                const Icon = cat.icons;
                const isActive = selectedCategory === cat.name;

                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{cat.name}</span>

                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryMobile"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:block md:col-span-3"
          >
            <div className="sticky top-24 space-y-2">
              <div className="mb-4 px-2">
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Categories
                </h3>
                <p className="text-xs text-gray-500">Choose your interest</p>
              </div>
              {categories.map((cat) => {
                const Icon = cat.icons;
                const isActive = selectedCategory === cat.name;

                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 ${
                      isActive
                        ? "bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeLineDesktop"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                        isActive
                          ? "bg-white/20 backdrop-blur-sm"
                          : "bg-gray-100 group-hover:bg-blue-50"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-600 group-hover:text-blue-600"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isActive
                            ? "text-white"
                            : "text-gray-900 group-hover:text-blue-600"
                        }`}
                      >
                        {cat.name}
                      </p>
                    </div>
                    {isActive && (
                      <MdArrowForwardIos className="w-5 h-5 text-white" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.aside>
          <div className="md:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                variants={listVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                layout
                className="space-y-4"
              >
                {filteredPrograms.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-white rounded-2xl border border-gray-200"
                  >
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-500 text-lg font-medium">
                      No programs available in this category yet.
                    </p>
                  </motion.div>
                )}

                {filteredPrograms.map((program) => (
                  <motion.div
                    key={program.id}
                    variants={itemVariants}
                    layout
                    whileHover={{ y: -4 }}
                    className="group flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                  >
                    <div className="flex-1 space-y-3">
                      <h3 className="font-bold text-lg md:text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                        {program.title}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <FaClock className="text-blue-600" />
                          </div>
                          {program.duration}
                        </span>
                        <span className="flex items-center gap-2">
                          <div className="p-1.5 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
                            <FaStar className="text-yellow-600" />
                          </div>
                          {program.rating}
                        </span>
                        <span className="flex items-center gap-2">
                          <div className="p-1.5 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                            <FaChartSimple className="text-purple-600" />
                          </div>
                          {program.level}
                        </span>
                      </div>

                      <span className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <div className="p-1.5 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                          <FaUserFriends className="text-green-600" />
                        </div>
                        {formatNumber(program.students)} students registered
                      </span>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={`/programs/${program.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Learn Now
                        <MdArrowForwardIos className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
