export interface DisciplineHistoryProps {
    sigla: string
    disciplina: string
    periodo: string
    semestre: string
    aprovado: string
    mediaFinal?: string
    frequencia: string
    qtdFaltas: string
    observacao: string
    desistencia: string
}

export interface RawHistoryProps {
    ACD_AlunoId: string
    UNI_UnidadeId: string
    ACD_CursoId: string
    ACD_PeriodoId: string
    ACD_EstruturaCurricularId: string
    ACD_DisciplinaSigla: string
    ACD_DisciplinaNome: string
    ACD_AlunoHistoricoItemId: string
    ACD_AlunoHistoricoItemPeriodoOferecimentoId: string
    ACD_AlunoHistoricoItemMediaFinal: string
    ACD_AlunoHistoricoItemQtdFaltas: string
    ACD_AlunoHistoricoItemFrequencia: string
    ACD_AlunoHistoricoTipoObservacaoId: string
    GER_TipoObservacaoHistoricoDescricao: string
    ACD_AlunoHistoricoItemUnidadeId: string
    ACD_AlunoHistoricoItemPeriodoId: string
    ACD_AlunoHistoricoItemCursoId: string
    ACD_AlunoHistoricoItemEstruturaCurricularId: string
    ACD_AlunoHistoricoItemDesistenciaData: string
    ACD_AlunoHistoricoItemTurmaId: string
    ACD_AlunoHistoricoTipoMatriculaSituacaoId: string
    ACD_AlunoHistoricoItemProfessorId: string
    GER_TipoMotivoDeleteId: string
    ACD_AlunoHistoricoItemAprovada: string
}
