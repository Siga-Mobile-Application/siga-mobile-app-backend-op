export interface ScheduleProps {
    sigla: string
    disciplina: string
    turma: string
    professor: string
    dia: string
    horario: string[]
}

export interface ScheduleClassProps {
    horario: string
    sigla: string
    turma: string
}