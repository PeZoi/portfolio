import { createClient } from "@/utils/supabase/server";
import type { Profile, Skill } from "@/types/database";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/portfolio/HeroSection";
import AboutSection from "@/components/portfolio/AboutSection";
import SkillsSection from "@/components/portfolio/SkillsSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import ContactSection from "@/components/portfolio/ContactSection";
import Footer from "@/components/portfolio/Footer";
import ScrollProgressTerminal from "@/components/portfolio/ScrollProgressTerminal";

/** Kiểu dữ liệu project đã join skills qua project_skills */
interface RawProjectRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  demo_url: string | null;
  github_url: string | null;
  featured: boolean;
  order_index: number;
  project_skills: {
    skills: Skill | null;
  }[];
}

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .single();

  const profile = (profileData as Profile) ?? null;

  // 2. Fetch user_skills (kỹ năng đã gán cho portfolio) JOIN skills
  const { data: userSkillsData } = await supabase
    .from("user_skills")
    .select("*, skills(*)")
    .order("order_index", { ascending: true });

  // Trích xuất danh sách skills từ user_skills
  const portfolioSkills: Skill[] = (userSkillsData ?? [])
    .map((us: { skills?: Skill }) => us.skills)
    .filter((s): s is Skill => !!s);

  // 3. Fetch projects JOIN project_skills → skills
  const { data: projectsData } = await supabase
    .from("projects")
    .select(`
      id, title, slug, description, image_url, demo_url, github_url, featured, order_index,
      project_skills (
        skills (*)
      )
    `)
    .order("order_index", { ascending: true });

  // Chuẩn hóa dữ liệu projects + skills đính kèm
  const projects = ((projectsData ?? []) as RawProjectRow[]).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    image_url: p.image_url,
    demo_url: p.demo_url,
    github_url: p.github_url,
    featured: p.featured,
    order_index: p.order_index,
    skills: (p.project_skills ?? [])
      .map((ps) => ps.skills)
      .filter((s): s is Skill => !!s),
  }));

  return (
    <main className="overflow-x-hidden">
      <Navbar brandName={profile?.full_name} />
      <HeroSection profile={profile} />
      <AboutSection profile={profile} />
      <SkillsSection skills={portfolioSkills} />
      <ProjectsSection projects={projects} />
      <ContactSection />
      <Footer profile={profile} />
      <ScrollProgressTerminal />
    </main>
  );
}
