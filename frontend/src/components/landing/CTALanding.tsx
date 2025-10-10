import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CTALanding: React.FC = () => (
    <motion.section
    // className="py-16 bg-gradient-to-r from-accent/10 to-transparent"
    // initial={{ opacity: 0, y: 12 }}
    // whileInView={{ opacity: 1, y: 0 }}
    // viewport={{ once: true, amount: 0.4 }}
    // transition={{ duration: 0.6 }}
    // aria-label="Call to action"
    >
        {/* <div className="container mx-auto px-6 lg:px-12 text-center">
            <h3 className="text-2xl font-bold">Ready to bring your idea to life?</h3>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Join thousands of creators who used DotFunding to launch successful campaigns.</p>
            <div className="mt-6">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/create-project" className="inline-block bg-accent text-black px-6 py-3 rounded-lg font-semibold">Start Your Project</Link>
                </motion.div>
            </div>
        </div> */}
    </motion.section>
);

export default CTALanding;
