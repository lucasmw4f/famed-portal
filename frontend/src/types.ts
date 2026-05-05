export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'student';
  created_at: string;
  photo?: string | null;
  // student fields
  student_id?: number;
  matricula?: string;
  semester?: number;
  cpf?: string;
  phone?: string;
}

export interface Student {
  id: number;
  user_id: number;
  student_id: number;
  name: string;
  email: string;
  matricula: string;
  semester: number;
  created_at: string;
  cpf?: string;
  phone?: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  semester: number;
  workload: number;
}

export interface Enrollment {
  enrollment_id: number;
  subject_id: number;
  code: string;
  name: string;
  semester: number;
  workload: number;
  n1: number | null;
  n2: number | null;
  n3: number | null;
  final_exam: number | null;
  total_classes: number;
  absences: number;
}

export function calcMedia(n1: number | null, n2: number | null, n3: number | null): number | null {
  const vals = [n1, n2, n3].filter((v) => v !== null) as number[];
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function calcStatus(enroll: Enrollment): {
  label: string;
  cls: string;
} {
  const { n1, n2, n3, final_exam, total_classes, absences } = enroll;
  const maxAbsences = Math.floor(enroll.workload * 0.25);

  if (total_classes > 0 && absences > maxAbsences) {
    return { label: 'Rep. Falta', cls: 'badge-reprovado' };
  }

  const media = calcMedia(n1, n2, n3);
  if (media === null) return { label: 'Cursando', cls: 'badge-cursando' };

  if ([n1, n2, n3].filter((v) => v !== null).length < 3) {
    return { label: 'Cursando', cls: 'badge-cursando' };
  }

  if (media >= 7.0) return { label: 'Aprovado', cls: 'badge-aprovado' };
  if (media >= 5.0) return { label: 'Aprovado', cls: 'badge-aprovado' };
  if (media >= 3.0) {
    if (final_exam === null) return { label: 'Em Exame', cls: 'badge-exame' };
    const novaMedia = (media + final_exam) / 2;
    return novaMedia >= 5.0
      ? { label: 'Aprovado', cls: 'badge-aprovado' }
      : { label: 'Rep. Nota', cls: 'badge-reprovado' };
  }
  return { label: 'Rep. Nota', cls: 'badge-reprovado' };
}

export function fmtGrade(v: number | null): string {
  if (v === null || v === undefined) return '—';
  return v.toFixed(1);
}

export function fmtFreq(total: number, absences: number): string {
  if (total === 0) return '—';
  return (((total - absences) / total) * 100).toFixed(1) + '%';
}
