import React from 'react';
import { Rocket, Users, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ Icon, title, desc }: { Icon: any; title: string; desc: string }) => (
    <motion.div
        className="bg-white/5 p-6 rounded-lg border border-white/6"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.03 }}
    >
        <div className="w-12 h-12 bg-accent/20 rounded-md flex items-center justify-center mb-4">
            <Icon className="text-accent" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </motion.div>
);

const FeaturesLanding: React.FC = () => {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="text-center mb-12">
                    <motion.h2
                        className="text-3xl font-bold"
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6 }}
                    >
                        Everything you need to launch
                    </motion.h2>
                    <motion.p
                        className="mt-2 text-muted-foreground max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        Tools for creators to build campaigns, offer rewards, and engage backers — all in one place.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard Icon={Rocket} title="Fast Launch" desc="Create a campaign in minutes with easy setup and templates." />
                    <FeatureCard Icon={Users} title="Community" desc="Grow and interact with backers using updates and comments." />
                    <FeatureCard Icon={Gift} title="Reward Tiers" desc="Offer flexible rewards and manage pledge fulfillment." />
                </div>
            </div>
        </section>
    );
};

export default FeaturesLanding;
