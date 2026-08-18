"use client";

import { contactUserSchema, ContactUserFormData } from "@/lib/validations/auth";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaArrowRight } from "react-icons/fa";
import { toast } from "sonner";
import { ContactData } from "../data/contact";

interface ContactUserProps {
  className?: string;
}

export default function ContactSection({ className }: ContactUserProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactUserFormData>({
    resolver: zodResolver(contactUserSchema),
  });

  const onSubmit = async (data: ContactUserFormData) => {
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Registration failed");
      }
      toast.success("Message sent successfully! ", {
        description: " We'll get back to you soon.",
      });
      reset();
    } catch (err) {
      toast.error("Failed Message!", {
        description: err instanceof Error ? err.message : "Please Try Again!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="w-full flex items-center justify-center bg-linear-to-b from-gray-50 to-white py-20 px-6"
    >
      <motion.div
        className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-5 sm:p-8 md:p-12 lg:p-14 flex flex-col lg:flex-row gap-10 lg:gap-16 hover:shadow-2xl transition-shadow duration-500 border border-gray-100"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="lg:w-2/5 flex flex-col justify-center"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 text-gray-900">
            Contact Us
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-lg leading-relaxed">
            Have questions or want to collaborate? Fill out the form and we'll
            get back to you within 24 hours.
          </p>

          <div className="space-y-2">
            {ContactData.map((contact) => (
              <motion.a
                key={contact.label}
                href={contact.href}
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all group"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                  <contact.icon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">
                    {contact.title}
                  </p>
                  <p className="text-blue-600 font-semibold text-sm truncate group-hover:underline">
                    {contact.label}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="lg:w-3/5"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3 sm:gap-5"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Jhon Doe"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      {...field}
                      international
                      defaultCountry="ID"
                      className={`phone-input w-full  ${
                        errors.phoneNumber ? "phone-error" : ""
                      }`}
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600 mt-1 ">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                {...register("Subject")}
                className={`w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${
                  errors.Subject
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="How can we help you?"
              />
              {errors.Subject && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.Subject.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message<span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("Message")}
                className={`w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${
                  errors.Message
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                rows={4}
                placeholder="Tell us more about inquiry..."
              />
              {errors.Message && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.Message.message}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base sm:text-lg  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  Send Message
                  <FaArrowRight />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </section>
  );
}
