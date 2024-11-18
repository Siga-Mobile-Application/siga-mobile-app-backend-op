import { DateGradeProps, GradeProps } from "../../interfaces/grade";
import { RawHistoryProps } from "../../interfaces/history";

export function transformData(json: string, type: 'history' | 'scheduleHeader' | 'scheduleContent' | 'grades') {
    const parsedData: RawHistoryProps[] | GradeProps[] | any[] = JSON.parse(json);
    let data: any[] = [];

    switch (type) {
        case 'history':
            data = parsedData.map(item => {
                return {
                    sigla: item.ACD_DisciplinaSigla,
                    disciplina: item.ACD_DisciplinaNome,
                    periodo: item.ACD_AlunoHistoricoItemPeriodoOferecimentoId,
                    aprovado: item.ACD_AlunoHistoricoTipoObservacaoId == "3" ? "Aprovado" : item.ACD_AlunoHistoricoTipoObservacaoId == "2" ? "Em curso" : "Não aprovado",
                    mediaFinal: item.ACD_AlunoHistoricoItemMediaFinal,
                    frequencia: item.ACD_AlunoHistoricoItemFrequencia,
                    qtdFaltas: item.ACD_AlunoHistoricoItemQtdFaltas,
                    observacao: item.GER_TipoObservacaoHistoricoDescricao,
                    semestre: item.ACD_PeriodoId,
                    desistencia: item.ACD_AlunoHistoricoItemDesistenciaData
                };
            });
            break;

        case 'scheduleHeader':
            data = parsedData.map(item => {
                return {
                    sigla: item[0],
                    disciplina: item[1],
                    turma: item[2],
                    professor: item[3],
                    dia: '',
                    horario: []
                }
            });
            break;

        case 'scheduleContent':
            data = parsedData.map(item => {
                return {
                    horario: item[1],
                    sigla: item[2],
                    turma: item[3]
                }
            });
            break;

        case 'grades':
            data = parsedData.map(item => {
                return {
                    disciplina: item.ACD_DisciplinaNome,
                    sigla: item.ACD_DisciplinaSigla,
                    mediaFinal: item.ACD_AlunoHistoricoItemMediaFinal,
                    faltas: item.ACD_AlunoHistoricoItemQtdFaltas,
                    frequencia: item.ACD_AlunoHistoricoItemFrequencia,
                    datas: item.Datas.map((data: DateGradeProps) => ({
                        titulo: data.ACD_PlanoEnsinoAvaliacaoTitulo,
                        data_prevista: data.ACD_PlanoEnsinoAvaliacaoTitulo,
                        avaliacoes: data.Avaliacoes.map((avaliacao) => ({
                            nota_parcial: avaliacao.ACD_PlanoEnsinoAvaliacaoParcialNota,
                            data_lancamento: avaliacao.ACD_PlanoEnsinoAvaliacaoParcialDataLancamento
                        }))
                    }))
                }
            });
            break;

        default:
            break;
    }

    return data;
}
