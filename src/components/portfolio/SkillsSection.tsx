"use client";

import { motion } from "framer-motion";
import type { Skill } from "@/types/database";
import { SKILL_CATEGORIES } from "@/types/database";

interface SkillsSectionProps {
  skills: Skill[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  // Nhóm kỹ năng theo category
  const groupedSkills = SKILL_CATEGORIES.reduce(
    (acc, cat) => {
      const catSkills = skills.filter((s) => s.category === cat);
      if (catSkills.length > 0) acc[cat] = catSkills;
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  const categories = Object.keys(groupedSkills);

  if (categories.length === 0) return null;

  return (
    <section id="skills" className="relative section-spacing overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-zinc-50/50 dark:bg-zinc-950/30" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 max-w-2xl"
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Công nghệ & Kỹ năng
          </h2>
          <div className="mt-4 h-[2px] w-12 rounded-full bg-accent/60" />
          <p className="mt-5 text-base leading-relaxed text-text-muted md:text-lg">
            Các công nghệ tôi sử dụng thành thạo để xây dựng sản phẩm chất lượng cao.
          </p>
        </motion.div>

        {/* Skill categories */}
        <div className="space-y-14">
          {categories.map((category, catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: catIndex * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Category label */}
              <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted/70">
                {category}
              </h3>

              {/* Skill items grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {groupedSkills[category].map((skill, skillIndex) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      delay: skillIndex * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group flex flex-col items-center gap-3 rounded-xl border border-card-border/50 bg-card/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-card/80 hover:shadow-lg hover:shadow-accent/5 active:scale-[0.97]"
                  >
                    {/* SVG Icon */}
                    {skill.svg_icon ? (
                      <div
                        className="skill-icon h-9 w-9 text-zinc-500 dark:text-zinc-400 transition-transform duration-300 group-hover:scale-110 [&_svg]:h-full [&_svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: skill.svg_icon }}
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <span className="text-sm font-bold text-text-muted/40">
                          {skill.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Skill name */}
                    <span className="text-center text-[11px] font-medium leading-tight text-text-muted transition-colors duration-300 group-hover:text-foreground">
                      {skill.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
