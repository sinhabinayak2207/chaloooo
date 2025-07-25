"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import Section from "@/components/ui/Section";
import { useAchievements, Achievement } from "@/context/AchievementContext";

const milestones = [
  { number: "55+", label: "Global Partners" },
  { number: "30+", label: "Countries Served" },
  { number: "5+", label: "Years Experience" },
  { number: "50000+", label: "Products Delivered" },
];

export default function AchievementsPage() {
  // Use the achievements context
  const { achievements, loading } = useAchievements();
  
  return (
    <div>
      {/* Hero Section */}
      <Section background="gradient" paddingY="lg">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="text-gray-700">Our</span> <span className="bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">Achievements</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-700 mb-8"
          >
            Recognized for excellence, quality, and innovation in the B2B industry
          </motion.p>
        </div>
      </Section>

      {/* Milestones */}
      <Section background="light">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-white rounded-xl shadow-md"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">
                {milestone.number}
              </div>
              <div className="mt-2 text-gray-600">{milestone.label}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Certifications Grid */}
      <Section background="white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-700">Certifications & Awards</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
            Since 2020, we have been reliably supplying high-quality materials and agricultural commodities to businesses across industries. We take pride in being a trusted partner for companies seeking excellence and consistency in their supply chain.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
              {achievements.map((achievement: Achievement, index: number) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col md:flex-row gap-6 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-full md:w-1/3 relative h-[200px]">
                    {achievement.imageUrl ? (
                      <Image 
                        src={achievement.imageUrl} 
                        alt={achievement.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-blue-600 to-teal-500 absolute inset-0 flex items-center justify-center p-8">
                        <div className="text-center text-white">
                          <div className="text-4xl md:text-5xl font-bold">{achievement.year}</div>
                          <div className="text-sm text-gray-200">Year Awarded</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{achievement.title}</h3>
                      <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {achievement.year}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{achievement.description}</p>
                    {achievement.certificateUrl && (
                      <a 
                        href={achievement.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                      >
                        View Certificate
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {achievements.length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  No achievements found.
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* Testimonials */}
      <Section background="light">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-700">What Our Partners Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our partners and clients have to say about working with us.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 text-gray-700 gap-8">
          {[
            {
              quote: "B2B Showcase has been an invaluable partner in our supply chain. Their quality and reliability are unmatched.",
              author: "",
              position: ""
            },
            {
              quote: "The team's expertise and commitment to excellence have helped us streamline our operations significantly.",
              author: "",
              position: ""
            },
            {
              quote: "Their customer service is exceptional. They truly understand the needs of B2B clients.",
              author: "",
              position: ""
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-teal-400 flex items-center justify-center text-white font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div className="ml-3">
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.position}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
}
