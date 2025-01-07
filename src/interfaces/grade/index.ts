export interface GradeProps {
    ACD_DisciplinaSigla: string
    ACD_DisciplinaNome: string
    ACD_AlunoHistoricoItemMediaFinal: string
    ACD_AlunoHistoricoItemQtdFaltas: string
    ACD_AlunoHistoricoItemFrequencia: string
    Datas: DateGradeProps[]
}

export interface DateGradeProps {
    ACD_PlanoEnsinoAvaliacaoTitulo: string
    ACD_PlanoEnsinoAvaliacaoDataPrevista: string
    Avaliacoes: AssessmentProps[]
}

export interface AssessmentProps {
    ACD_PlanoEnsinoAvaliacaoParcialNota: string
    ACD_PlanoEnsinoAvaliacaoParcialDataLancamento: string
}
