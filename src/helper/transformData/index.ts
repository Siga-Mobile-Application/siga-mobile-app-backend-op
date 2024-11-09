import { DisciplineHistoryProps } from "../../interfaces/history";
import { ScheduleProps } from "../../interfaces/schedule";

export function transformData(json: string, type: 'history' | 'schedule') {
    const parsedData: [string[]] = JSON.parse(json);
    let data: DisciplineHistoryProps[] | ScheduleProps[] = [];

    switch (type) {
        case 'history':
            data = parsedData.map(item => {
                return {
                    sigla: item[0],
                    disciplina: item[1],
                    periodo: item[2],
                    aprovado: item[3].match("checkTrue") ? "Aprovado" : "Não aprovado",
                    mediaFinal: item[4] === "--" ? undefined : item[4].trim(),
                    frequencia: item[5].trim(),
                    qtdFaltas: item[6],
                    observacao: item[7]
                };
            });
            break;

        case 'schedule':
            data = parsedData.map(item => {
                return {
                    sigla: '',
                    disciplina: '',
                    turma: '',
                    professor: 'string',
                    dia: 'string',
                    horario: []
                }
            })

        default:
            break;
    }

    return data;
}
