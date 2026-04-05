import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import type { Job } from "@/lib/types";
import { MessageSquare, ShieldCheck, Brain, Zap, MapPin, Clock, Users, UserPlus, Trophy, Sparkles } from "lucide-react";
import { LogoIcon } from "@/components/Logo";

/* ─── Animated Counter ─── */
function Counter({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      // Easing function (easeOutQuart)
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      setN(Math.floor(easeOut * to));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [to, duration]);

  return <span>{n.toLocaleString()}{suffix}</span>;
}

function HeroHeadline() {
  const words = ["Opportunities", "Startups", "Founders", "Your Future"];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), 1500);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 40 : 80);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting]);

  return (
    <div className="inline-flex items-center text-left min-h-[80px]">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 pb-1">
        {words[index].substring(0, subIndex)}
      </span>
      {/* Blinking Cursor with moving shine */}
      <motion.span
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ opacity: { repeat: Infinity, duration: 1, ease: "easeInOut" } }}
        className="inline-block w-[4px] lg:w-[6px] h-[56px] lg:h-[72px] bg-gradient-to-b from-blue-400 via-purple-500 to-indigo-500 ml-2 rounded-full relative overflow-hidden shrink-0 translate-y-1 lg:translate-y-2"
      >
        <motion.div
           animate={{ y: ['-100%', '200%'] }}
           transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
           className="w-full h-1/2 bg-white/70 blur-[1px]"
        />
      </motion.span>
    </div>
  );
}

const trustLogos = [
  "Notion", "Figma", "Slack", "GitHub", "Shopify", 
  "Raycast", "Resend", "Planetscale", "Supabase", "Stripe", "Vercel", "Linear"
];

export default function Landing() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);

  useEffect(() => {
    api.get("/api/jobs?limit=6").then(r => setFeaturedJobs(r.data)).catch(() => setFeaturedJobs([]));
  }, []);

  return (
    <div className="flex flex-col bg-white text-gray-900 font-sans overflow-x-hidden">
      
      {/* ════════════════════  HERO  ════════════════════ */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden min-h-[90vh]">
        
        {/* Animated Background Layout */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Main Background Orbs */}
          <motion.div
            animate={{ y: [0, -50, 0], x: [0, 50, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-purple-400 opacity-30 rounded-full blur-[80px]"
          />
          <motion.div
            animate={{ y: [0, 50, 0], x: [0, -50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-blue-400 opacity-20 rounded-full blur-[80px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] left-[30%] w-[600px] h-[400px] bg-indigo-400 opacity-20 rounded-[100%] blur-[100px]"
          />

          {/* Floating Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

          {/* Floating abstract particles */}
          {Array.from({ length: 8 }).map((_, i) => (
             <motion.div
               key={i}
               className="absolute w-2 h-2 bg-indigo-500 rounded-full"
               initial={{ 
                 opacity: 0,
                 x: (Math.random() - 0.5) * 400,
                 y: 0
               }}
               animate={{ 
                 y: -300 - Math.random() * 200,
                 opacity: [0, 0.6, 0]
               }}
               transition={{ 
                 duration: Math.random() * 6 + 6, 
                 repeat: Infinity, 
                 ease: "linear",
                 delay: Math.random() * 5
               }}
               style={{
                 left: `${10 + Math.random() * 80}%`,
                 bottom: `${Math.random() * 20}%`,
               }}
             />
          ))}
        </div>
        
        <div className="container relative z-10 flex flex-col items-center text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-white shadow-sm px-4 py-1.5 text-sm font-medium text-gray-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              1,200+ developers hired this month <span className="text-gray-400">→</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-[84px] font-black tracking-[-0.03em] leading-none mb-6 flex flex-col items-center"
          >
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-[length:200%_auto] animate-shimmer">
              Where D<span className="text-indigo-600">e</span>velopers
            </div>
            <div className="flex items-center mt-2 lg:mt-4 text-[#171717]">
              <span className="mr-4">Meet</span>
              <HeroHeadline />
            </div>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-lg sm:text-xl text-gray-500 mb-10 leading-relaxed font-medium"
          >
            Skip the cold applications. Chat directly with founders, get matched instantly,
            and land your next role at a fast-growing startup.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-base font-semibold transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group">
                Get Started Free <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>
            <Link to="/jobs" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto rounded-xl bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-800 px-8 py-4 text-base font-semibold transition-all">
                Browse Opportunities
              </button>
            </Link>
          </motion.div>

          {/* Social Proof Stats at Bottom of Hero */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 pt-10"
          >
            {/* Avatars */}
            <div className="flex -space-x-3">
              {['👨‍💻','👩‍💻','🧑‍💻','👨‍💼','👩‍💼'].map((emoji, i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-sm shadow-sm z-[5-i]">
                  {emoji}
                </div>
              ))}
            </div>
            
            <div className="text-left border-l border-gray-200 pl-6">
              <div className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">1,200+</div>
              <div className="text-xs text-gray-500 font-medium tracking-wide">Active devs</div>
            </div>
            
            <div className="text-left border-l border-gray-200 pl-6">
              <div className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">500+</div>
              <div className="text-xs text-gray-500 font-medium tracking-wide">Startups</div>
            </div>
            
            <div className="text-left border-l border-gray-200 pl-6">
              <div className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">4.9 ⭐</div>
              <div className="text-xs text-gray-500 font-medium tracking-wide">Avg. rating</div>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 1.2 }}
             className="absolute bottom-10 left-1/2 -translate-x-1/2 w-6 h-10 border-2 border-purple-200 rounded-full flex justify-center p-1"
          >
             <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="w-1.5 h-2 bg-purple-400 rounded-full"
             />
          </motion.div>
        </div>
      </section>

      {/* ════════════════════  TRUSTED BY  ════════════════════ */}
      <section className="py-24 bg-white border-t border-gray-50 relative overflow-hidden">
        <div className="relative z-10 text-center w-full">
          <p className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase mb-12">
            Trusted by teams at leading startups
          </p>
          
          <div className="relative flex overflow-hidden w-full mask-image-fade border-y border-transparent">
            <div className="flex animate-marquee whitespace-nowrap opacity-40 font-bold text-2xl tracking-tight text-gray-400 grayscale hover:grayscale-0 transition-all duration-500 items-center">
              {[...trustLogos, ...trustLogos].map((logo, i) => (
                <span key={i} className="mx-12 hover:text-gray-900 transition-colors duration-300 cursor-default">{logo}</span>
              ))}
            </div>
            {/* Clone of the same content for seamless loop */}
            <div className="flex animate-marquee whitespace-nowrap opacity-40 font-bold text-2xl tracking-tight text-gray-400 grayscale hover:grayscale-0 transition-all duration-500 items-center absolute top-0">
              {[...trustLogos, ...trustLogos].map((logo, i) => (
                <span key={i} className="mx-12 hover:text-gray-900 transition-colors duration-300 cursor-default">{logo}</span>
              ))}
            </div>
          </div>

          {/* Big minimal stats */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto divide-y md:divide-y-0 md:divide-x divide-gray-100 px-4">
            <div className="py-4">
              <div className="text-4xl md:text-5xl font-black mb-2 text-gray-900">1,000+</div>
              <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Developers Hired</div>
            </div>
            <div className="py-4">
              <div className="text-4xl md:text-5xl font-black mb-2 text-gray-900">500+</div>
              <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Startups</div>
            </div>
            <div className="py-4">
              <div className="text-4xl md:text-5xl font-black mb-2 text-gray-900">48h</div>
              <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">Avg. Time to Hire</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════  FEATURED ROLES  ════════════════════ */}
      <section className="py-24 bg-white relative">
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="text-xs font-bold text-indigo-600 tracking-[0.2em] uppercase mb-4">Opportunities</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Featured Roles</h2>
            </div>
            <p className="text-gray-500 font-medium">Hand-picked roles at the fastest-growing startups</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {featuredJobs.length > 0 ? featuredJobs.map((job, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0px 20px 40px rgba(0,0,0,0.04)" }}
                key={job.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative group cursor-pointer transition-all duration-300"
              >
                {/* Hot badge randomly assigned for demo or specific roles */}
                {idx % 3 === 0 && (
                  <div className="absolute -top-3 -right-3 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    HOT
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[14px] flex items-center justify-center text-xl font-bold text-white shadow-inner" style={{ 
                      background: `linear-gradient(135deg, hsl(${job.company.charCodeAt(0) * 10 % 360}, 80%, 60%), hsl(${job.company.charCodeAt(0) * 10 % 360 + 40}, 80%, 50%))`
                    }}>
                      {job.company.substring(0, 1).toUpperCase()}
                      {job.company.substring(1, 2).toLowerCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight mb-1">{job.title}</h3>
                      <p className="text-gray-500 text-sm font-medium">{job.company}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {job.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {job.type}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-gray-400"><Users className="w-3.5 h-3.5" /> {job.applicants} applied</span>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                No jobs available right now. Check back soon!
              </div>
            )}
          </div>

          <div className="mt-12 flex justify-center">
            <Link to="/jobs">
              <button className="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2">
                View All Jobs <span className="tracking-tighter">→</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════  HOW IT WORKS (PREMIUM)  ════════════════════ */}
      <section id="process" className="py-32 bg-white relative overflow-hidden border-t border-gray-100">
        {/* Decorative Grid & Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-50 via-purple-50 to-blue-50 opacity-50 blur-[100px] rounded-full" />
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="container relative z-10 w-full max-w-6xl mx-auto">
          <div className="text-center mb-20 md:mb-28">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-xs font-bold text-indigo-600 tracking-[0.2em] uppercase mb-6"
            >
              <Sparkles className="w-4 h-4" /> Seamless Process
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Works</span>
            </h2>
            <p className="text-gray-500 font-medium text-lg max-w-xl mx-auto">
              Your next career move, simplified. Three effortless steps to connect with the world's most innovative startups.
            </p>
          </div>

          <div className="relative">
             {/* Desktop Line Connector */}
             <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-gray-100">
               <motion.div 
                 className="h-full w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-40 origin-left"
                 animate={{ scaleX: [0, 1, 0], translateX: ['-100%', '0%', '100%'] }}
                 transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
               />
             </div>
             
             <div className="grid md:grid-cols-3 gap-8 lg:gap-12 pl-4 pr-4">
               {[
                 { step: "01", title: "Create Profile", icon: UserPlus, desc: "Showcase your skills, projects, and what you're looking for.", color: "text-indigo-600", bg: "bg-indigo-50", shadow: "group-hover:shadow-indigo-500/20", glow: "from-indigo-500/0 via-indigo-500/5 to-indigo-500/0" },
                 { step: "02", title: "Apply & Chat", icon: MessageSquare, desc: "Apply directly and chat immediately with founders in real-time.", color: "text-purple-600", bg: "bg-purple-50", shadow: "group-hover:shadow-purple-500/20", glow: "from-purple-500/0 via-purple-500/5 to-purple-500/0" },
                 { step: "03", title: "Get Hired", icon: Trophy, desc: "Negotiate terms and land your dream role without the wait.", color: "text-pink-600", bg: "bg-pink-50", shadow: "group-hover:shadow-pink-500/20", glow: "from-pink-500/0 via-pink-500/5 to-pink-500/0" }
               ].map((s, i) => (
                 <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: i * 0.2, type: "spring", stiffness: 50 }}
                   key={i} 
                   className="relative flex flex-col z-10"
                 >
                   <div className={`group relative bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl ${s.shadow} transition-all duration-500 hover:-translate-y-2 overflow-hidden`}>
                     {/* Hover glow beam */}
                     <div className={`absolute inset-0 bg-gradient-to-br ${s.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                     
                     <div className="flex flex-col items-center text-center">
                       <div className={`w-28 h-28 rounded-full ${s.bg} border-4 border-white shadow-xl flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out`}>
                         <div className="absolute inset-0 rounded-full border-2 border-white/50" />
                         <s.icon className={`w-10 h-10 ${s.color}`} strokeWidth={2} />
                       </div>
                       
                       <div className="text-[12px] font-black text-gray-300 tracking-[0.3em] uppercase mb-4 group-hover:text-gray-400 transition-colors">
                         Step {s.step}
                       </div>
                       <h3 className={`text-2xl font-black text-gray-900 mb-4 transition-colors ${s.color.replace('text-', 'group-hover:text-')}`}>
                         {s.title}
                       </h3>
                       <p className="text-gray-500 text-[15px] font-medium leading-relaxed">
                         {s.desc}
                       </p>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* ════════════════════  FEATURES  ════════════════════ */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-600 tracking-[0.2em] uppercase mb-4">The Difference</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
              Why DevHireX is <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">Different</span>
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg pt-2">
              We're not another job board. We're a hiring engine built for startups.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-[24px] p-8 pb-10 border border-gray-100 shadow-sm flex flex-col items-start hover:shadow-lg transition-all"
            >
              <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg mb-8 inline-flex items-center">
                Direct <span className="text-indigo-400 font-medium ml-1">Access</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Middlemen</h3>
              <p className="text-gray-500 font-medium text-[15px] leading-relaxed mb-8 flex-grow">
                Talk to decision-makers from day one. No recruiters gatekeeping your applications.
              </p>
              <a href="#" className="text-indigo-600 text-[15px] font-semibold flex items-center hover:text-indigo-700 group">
                Learn more <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-[24px] p-8 pb-10 border border-gray-100 shadow-sm flex flex-col items-start hover:shadow-lg transition-all"
            >
              <div className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg mb-8 inline-flex items-center">
                2x <span className="text-purple-400 font-medium ml-1">Faster Response</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Direct Founder Access</h3>
              <p className="text-gray-500 font-medium text-[15px] leading-relaxed mb-8 flex-grow">
                Skip the HR queue. Chat with the people actually building the product.
              </p>
              <a href="#" className="text-purple-600 text-[15px] font-semibold flex items-center hover:text-purple-700 group">
                Learn more <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-[24px] p-8 pb-10 border border-gray-100 shadow-sm flex flex-col items-start hover:shadow-lg transition-all"
            >
              <div className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg mb-8 inline-flex items-center">
                48h <span className="text-blue-400 font-medium ml-1">Avg. to Hire</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Faster Hiring Cycles</h3>
              <p className="text-gray-500 font-medium text-[15px] leading-relaxed mb-8 flex-grow">
                From application to offer in days, not months. Because great talent doesn't wait.
              </p>
              <a href="#" className="text-blue-600 text-[15px] font-semibold flex items-center hover:text-blue-700 group">
                Learn more <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════  CTA SECTION (Start Your Career Today)  ════════════════════ */}
      <section className="relative py-20 overflow-hidden bg-white border-t border-gray-50">
        
        {/* Simple White Background Grid Layout */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="container relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm px-4 py-1.5 text-sm font-medium text-gray-600">
            <span className="text-indigo-500 text-lg">✨</span>
            Join 1,200+ developers already on DevHireX
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none mb-6">
            Start Your Career
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Today</span>
          </h2>
          
          <p className="text-gray-500 font-medium max-w-lg mx-auto mb-10 text-[17px]">
            Join thousands of developers already landing roles at the world's most exciting startups.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Link to="/signup">
              <button className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-base font-semibold transition-all shadow-lg flex items-center justify-center gap-2 group">
                Get Started Free <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>
            <Link to="/jobs">
              <button className="w-full sm:w-auto rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-900 px-8 py-4 text-base font-semibold transition-all shadow-sm">
                Explore Jobs
              </button>
            </Link>
          </div>
          
          <p className="text-[11px] text-gray-400 font-medium tracking-wide">
            No credit card required · Free forever for developers
          </p>
        </div>
      </section>

      {/* ════════════════════  FOOTER  ════════════════════ */}
      <footer className="border-t border-gray-100 bg-white pt-16 pb-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-end md:items-start justify-between gap-10 mb-12">
            <div className="w-full md:w-auto text-left flex flex-col items-start">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md">
                  <LogoIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-gray-900">
                  DevHire<span className="text-[#6366f1]">X</span>
                </span>
              </Link>
              <p className="text-sm font-medium text-gray-500 max-w-[280px] leading-relaxed">
                The fastest way for developers to land roles at top startups.
              </p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col md:flex-col items-start md:items-end gap-6 justify-between flex-grow h-full">
               <div className="flex gap-6 text-[13px] font-semibold text-gray-400 mb-2 mt-2 md:mt-0">
                 <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
                 <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
                 <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
                 <a href="#" className="hover:text-gray-900 transition-colors">Blog</a>
               </div>

               <div className="flex gap-3">
                 <a href="#" className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all">
                   <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                 </a>
                 <a href="#" className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all">
                   <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                 </a>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-100 pt-8 pb-4 text-[11px] font-medium text-gray-400">
            <p>© 2026 DevHireX. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Built with <span className="text-red-500 text-sm">❤️</span> for developers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
