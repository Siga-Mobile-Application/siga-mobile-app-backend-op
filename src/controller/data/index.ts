import { Request, Response } from 'express'
import puppeteer, { Browser, Page } from "puppeteer";
import { decode } from '../../helper/auth';
import { transformData } from '../../helper/transformData';
import { globalContainerData, pageHistory, pageSchedule, pageLogin } from '../../constants';
import { ScheduleClassProps, ScheduleProps } from '../../interfaces/schedule';

export default class Data {
    static async getAll(req: Request, res: Response) {
        const { user, pass } = req.headers;
        const page: Page = res.locals.page;

        const raId = 'span_MPW0041vACD_ALUNOCURSOREGISTROACADEMICOCURSO';
        const ra = await page.waitForSelector(`#${raId}`).then((res) => {
            return res?.evaluate(val => val.textContent);
        });

        const nameId = 'span_MPW0041vPRO_PESSOALNOME';
        const name = await page.waitForSelector(`div #${nameId}`).then((res) => {
            return res?.evaluate(val => val.textContent?.substring(0, val.textContent?.lastIndexOf(' ')));
        });

        const emailId = 'span_MPW0041vINSTITUCIONALFATEC'
        const email = await page.waitForSelector(`div #${emailId}`).then((res) => {
            return res?.evaluate(val => val.textContent);
        });

        const imageId = 'MPW0041FOTO'
        const image = await page.waitForSelector(`div #${imageId}`).then((res) => {
            return res?.evaluate(val => val.querySelector('img')?.getAttribute('src'));
        });

        // await browser.close();

        return res.status(200).json({ ra: ra ?? "", name: name ?? "", email: email ?? "", picture: image ?? "" });
    }

    static async getHistory(req: Request, res: Response) {
        const { user, pass } = req.headers;
        const page: Page = res.locals.page;
        const browser: Browser = res.locals.browser;

        await page.goto(pageHistory, { waitUntil: 'networkidle2' });

        const historyCompleteRaw = await page.waitForSelector(`input[name=${globalContainerData()}]`, { hidden: true }).then((res) => {
            return res?.evaluate(val => val.value);
        }).catch(() => (''));

        const history = transformData(historyCompleteRaw ?? "", 'history');

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

        const scheduleHeader: ScheduleProps[] = transformData(scheduleHeaderRaw ?? "", 'scheduleHeader');

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
}