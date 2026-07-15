/** Kiểu dữ liệu cho bảng profiles */
export interface Profile {
  id: string;
  full_name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  resume_url: string | null;
  email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  updated_at: string;
}

/** Kiểu dữ liệu cho bảng projects */
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  demo_url: string | null;
  github_url: string | null;
  tags: string[];
  featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

/** Kiểu dữ liệu cho bảng skills (Kho kỹ năng chung) */
export interface Skill {
  id: string;
  name: string;
  category: string;
  svg_icon: string | null; // Lưu chuỗi SVG thô
  created_at: string;
}

/** Kiểu dữ liệu cho bảng user_skills (Kỹ năng hiển thị trên Portfolio) */
export interface UserSkill {
  id: string;
  skill_id: string;
  level: number;
  order_index: number;
  created_at: string;
  skills?: Skill; // Kết nối qua join query của Supabase
}

/** Kiểu dữ liệu cho bảng project_skills (Liên kết nhiều-nhiều) */
export interface ProjectSkill {
  project_id: string;
  skill_id: string;
}

/** Kiểu dữ liệu cho bảng messages */
export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "unread" | "read" | "archived";
  created_at: string;
}

/** Các danh mục kỹ năng hợp lệ */
export const SKILL_CATEGORIES = ["Frontend", "Backend", "Database", "Tools"] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
