import { Request, Response } from 'express'
import { Browser, Page } from "puppeteer";
import { transformData } from '../../helper/transformData';
import { globalContainerData, pageHistory, pageSchedule, pageLogin, pageGrades, globalAllInfo } from '../../constants';
import { ScheduleClassProps, ScheduleProps } from '../../interfaces/schedule';
import { StudentDataProps } from '../../interfaces/student';

export default class Data {
    static async getAll(req: Request, res: Response) {
        const { user, pass } = req.headers;
        const page: Page = res.locals.page;
        const browser: Browser = res.locals.browser;

        const dataRaw = await page.waitForSelector(`input[name=${globalAllInfo}]`, { hidden: true }).then((res) => {
            return res?.evaluate(val => val.value);
        }).catch(() => (''));

        if (!dataRaw) return res.status(400).json({ error: 'Não foi possível resgatar os dados' });

        const student: StudentDataProps = JSON.parse(dataRaw);

        const imageId = 'MPW0041FOTO'
        const image = await page.waitForSelector(`div #${imageId}`).then((res) => {
            return res?.evaluate(val => val.querySelector('img')?.getAttribute('src'));
        });

        await browser.close();

        return res.status(200).json({
            ra: student.MPW0041vACD_ALUNOCURSOREGISTROACADEMICOCURSO,
            name: student.vPRO_PESSOALNOME,
            email: student.MPW0041vINSTITUCIONALFATEC,
            situacao: student.vSITUACAO_MPAGE,
            periodo: student.vACD_PERIODODESCRICAO_MPAGE,
            curso: student.vACD_CURSONOME_MPAGE,
            unidade: student.vUNI_UNIDADENOME_MPAGE,
            semestre: student.MPW0041vACD_ALUNOCURSOCICLOATUAL,
            pp: student.MPW0041vACD_ALUNOCURSOINDICEPP,
            pr: student.MPW0041vACD_ALUNOCURSOINDICEPR,
            semestre_cursado: student.MPW0041vSEMESTRESCURSADOS,
            semestre_maximo: student.MPW0041vINTEGRALIZACAOMAX,
            semestre_restante: student.MPW0041vFALTA,
            picture: image ?? ""
        });
    }

    static async getHistory(req: Request, res: Response) {
        const { user, pass } = req.headers;
        const page: Page = res.locals.page;
        const browser: Browser = res.locals.browser;

        await page.goto(pageHistory, { waitUntil: 'networkidle2' });

        const dataRaw = await page.waitForSelector(`input[name=${globalAllInfo}]`, { hidden: true }).then((res) => {
            return res?.evaluate(val => val.value);
        }).catch(() => (''));

        if (!dataRaw) return res.status(400).json({ error: 'Não foi possível resgatar os dados' });

        const data = dataRaw.substring(dataRaw.indexOf('[{"ACD_AlunoId'), dataRaw.lastIndexOf(']') + 1);

        const history = transformData(data ?? "", 'history');

        browser.close();

        return res.status(200).json({ data: history });
    }

    static async getSchedule(req: Request, res: Response) {
        const { user, pass } = req.headers;
        const page: Page = res.locals.page;
        const browser: Browser = res.locals.browser;

        await page.goto(pageSchedule, { waitUntil: 'networkidle2' });

        const scheduleHeaderRaw = await page.waitForSelector(`input[name=${globalContainerData()}]`, { hidden: true }).then((res) => {
            return res?.evaluate(val => val.value);
        }).catch(() => (''));

        if (!scheduleHeaderRaw) return res.status(400).json({ error: 'Não foi possível resgatar os dados' });

        const scheduleHeader: ScheduleProps[] = transformData(scheduleHeaderRaw, 'scheduleHeader');

        for (let i = 2; i <= 7; i++) {
            const day = i == 2 ? "Segunda-Feira" : i == 3 ? "Terça-Feira" : i == 4 ? "Quarta-Feira" : i == 5 ? "Quinta-Feira" : i == 6 ? "Sexta-Feira" : "Sabado";

            const scheduleContentRaw = await page.waitForSelector(`input[name=${globalContainerData(i)}]`, { hidden: true }).then((res) => {
                return res?.evaluate(val => val.value);
            }).catch(() => (''));

            const scheduleContent: ScheduleClassProps[] = transformData(scheduleContentRaw ?? "", 'scheduleContent');

            scheduleContent.forEach(item => {
                scheduleHeader.forEach((header, index) => {
                    if (header.sigla == item.sigla) {
                        scheduleHeader[index].horario.push(item.horario);
                        scheduleHeader[index].dia = day;
                    }
                });
            });
        }

        browser.close();

        return res.status(200).json({ data: scheduleHeader });
    }

    static async getGrade(req: Request, res: Response) {
        const { user, pass } = req.headers;
        const page: Page = res.locals.page;
        const browser: Browser = res.locals.browser;

        await page.goto(pageGrades, { waitUntil: 'networkidle2' });

        const dataRaw = await page.waitForSelector(`input[name=${globalAllInfo}]`, { hidden: true }).then((res) => {
            return res?.evaluate(val => val.value);
        }).catch(() => (''));

        if (!dataRaw) return res.status(400).json({ error: 'Não foi possível resgatar os dados' });

        const objectName = '"vACD_ALUNONOTASPARCIAISRESUMO_SDT":';
        const data = dataRaw.substring(dataRaw.indexOf(objectName) + objectName.length, dataRaw.lastIndexOf('}]') + 2);

        const grades = transformData(data, 'grades');

        browser.close();

        return res.status(200).json({ data: grades });
    }
}
