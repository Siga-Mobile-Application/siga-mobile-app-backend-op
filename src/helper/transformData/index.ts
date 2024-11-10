import { DisciplineHistoryProps } from "../../interfaces/history";
import { ScheduleProps, ScheduleClassProps } from "../../interfaces/schedule";

export function transformData(json: string, type: 'history' | 'scheduleHeader' | 'scheduleContent') {
    const parsedData: [string[]] = JSON.parse(json);
    let data: any[] = [];

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

        default:
            break;
    }

    return data;
}
