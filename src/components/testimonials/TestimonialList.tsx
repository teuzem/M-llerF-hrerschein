import React from 'react';
import { motion } from 'framer-motion';
import TestimonialCard from './TestimonialCard';
import { Testimonial } from '../../pages/Testimonials';

interface TestimonialListProps {
  testimonials: Testimonial[];
  viewMode: 'grid' | 'list';
}

const TestimonialList: React.FC<TestimonialListProps> = ({ testimonials, viewMode }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (viewMode === 'grid') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {testimonials.map((testimonial) => (
          <motion.div key={testimonial.id} variants={itemVariants}>
            <TestimonialCard testimonial={testimonial} />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {testimonials.map((testimonial) => (
        <motion.div key={testimonial.id} variants={itemVariants}>
          <TestimonialCard testimonial={testimonial} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TestimonialList;
