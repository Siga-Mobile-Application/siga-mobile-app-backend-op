import { Browser, Page } from "puppeteer-core";
import { transformData } from '../../helper/transformData';
import { globalContainerData, pageHistory, pageSchedule, pageGrades, globalAllInfo } from '../../constants';
import { StudentDataProps } from '../../interfaces/student';
import { ScheduleClassProps, ScheduleProps } from '../../interfaces/schedule';
import { Request, Response } from 'express'

export default class Data {
    static async getBasic(req: Request, res: Response) {
        const page: Page = res.locals.page;
        const browser: Browser = res.locals.browser;

        try {
            const dataRaw = await page.waitForSelector(`input[name=${globalAllInfo}]`, { hidden: true }).then((res) => {
                if (res) return res.evaluate(val => val.value);
                throw "Não foi possível resgatar os dados";
            });

            const student: StudentDataProps = JSON.parse(`${dataRaw.substring(0, dataRaw.indexOf(',"vEMAILWEBSAI"'))}}`);

            const imageId = 'MPW0041FOTO'
            const image = await page.waitForSelector(`div #${imageId}`).then((res) => {
                return res?.evaluate(val => val.querySelector('img')?.getAttribute('src'));
            });

            return res.status(200).json({
                ra: student.MPW0041vACD_ALUNOCURSOREGISTROACADEMICOCURSO,
                nome: student.vPRO_PESSOALNOME.split('-')[0],
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
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Não foi possível resgatar os dados' });
        } finally {
            await browser.close();
        }
    }

    static async getHistory(req: Request, res: Response) {
        const page: Page = res.locals.page;
        const browser: Browser = res.locals.browser;

        try {
            await page.goto(pageHistory, { waitUntil: 'networkidle2' });

            const dataRaw = await page.waitForSelector(`input[name=${globalAllInfo}]`, { hidden: true }).then((res) => {
                if (res) return res.evaluate(val => val.value);
                throw "Não foi possível resgatar os dados";
            });

            const data = dataRaw.substring(dataRaw.indexOf('[{"ACD_AlunoId'), dataRaw.lastIndexOf(']') + 1);

            const history = transformData(data ?? "", 'history');

            return res.status(200).json({ data: history });

        } catch (error) {
            return res.status(400).json({ error: 'Não foi possível resgatar os dados' });
        } finally {
            await browser.close();
        }
    }

    static async getSchedule(req: Request, res: Response) {
        const page: Page = res.locals.page;
        const browser: Browser = res.locals.browser;

        try {
            await page.goto(pageSchedule, { waitUntil: 'networkidle2' });

            const scheduleHeaderRaw = await page.waitForSelector(`input[name=${globalContainerData()}]`, { hidden: true }).then((res) => {
                if (res) return res.evaluate(val => val.value);
                throw "Não foi possível resgatar os dados";
            });

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

            return res.status(200).json({ data: scheduleHeader });
        } catch (error) {
            return res.status(400).json({ error: 'Não foi possível resgatar os dados' });
        } finally {
            await browser.close();
        }
    }

    static async getGrade(req: Request, res: Response) {
        const page: Page = res.locals.page;
        const browser: Browser = res.locals.browser;

        try {
            await page.goto(pageGrades, { waitUntil: 'networkidle2' });

            const dataRaw = await page.waitForSelector(`input[name=${globalAllInfo}]`, { hidden: true }).then((res) => {
                if (res) return res.evaluate(val => val.value);
                throw "Não foi possível resgatar os dados";
            });

            const objectName = '"vACD_ALUNONOTASPARCIAISRESUMO_SDT":';
            const data = dataRaw.substring(dataRaw.indexOf(objectName) + objectName.length, dataRaw.lastIndexOf('}]') + 2);

            const grades = transformData(data, 'grades');

            return res.status(200).json({ data: grades });
        } catch (error) {
            return res.status(400).json({ error: 'Não foi possível resgatar os dados' });
        } finally {
            await browser.close();
        }
    }
}
