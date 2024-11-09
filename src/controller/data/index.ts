import { Request, Response } from 'express'
import puppeteer from "puppeteer";
import { decode } from '../../helper/auth';
import { transformData } from '../../helper/transformData';
import { globalContainerData, pageHistory, pageSchedule, pageLogin } from '../../constants';

export default class Data {
    static async getAll(req: Request, res: Response) {
        const { auth } = req.body;

        if (!auth) return res.status(400).json({ error: "Preencha todos os campos" });

        const credentials = decode(auth);

        const user = credentials.substring(0, credentials.lastIndexOf(' | ')).trim();
        const pass = credentials.substring(credentials.lastIndexOf('| ') + 1, credentials.length).trim();
        const credential = { user: user, pass: pass }

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(pageLogin, { waitUntil: 'networkidle2' }).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const nameInput = '#vSIS_USUARIOID';
        await page.type(nameInput, credential.user).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const passInput = '#vSIS_USUARIOSENHA'
        await page.type(passInput, credential.pass).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const confirmButton = 'BTCONFIRMA'
        await page.click(`input[name=${confirmButton}]`).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const result = await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 3000 }).then(() => {
            return '';
        }).catch(async () => {
            const resultId = 'span_vSAIDA';
            const result = await page.waitForSelector(`#${resultId}`).then((res) => {
                return res?.evaluate(val => val.querySelector('text')?.textContent);
            }).catch(() => { });

            return result ?? 'Problema com a conexão';
        });

        //In case of some error occurred
        if (result) return res.status(400).json({ response: result });

        await page.locator('.PopupHeaderButton').setTimeout(2000).click().catch(() => { });

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

        await browser.close();

        return res.status(200).json({ ra: ra ?? "", name: name ?? "", email: email ?? "", picture: image ?? "" });
    }

    static async getHistory(req: Request, res: Response) {
        const { auth } = req.body;

        if (!auth) return res.status(400).json({ error: "Preencha todos os campos" });

        const credentials = decode(auth);

        const user = credentials.substring(0, credentials.lastIndexOf(' | ')).trim();
        const pass = credentials.substring(credentials.lastIndexOf('| ') + 1, credentials.length).trim();
        const credential = { user: user, pass: pass }

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(pageLogin, { waitUntil: 'networkidle2' }).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const nameInput = '#vSIS_USUARIOID';
        await page.type(nameInput, credential.user).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const passInput = '#vSIS_USUARIOSENHA'
        await page.type(passInput, credential.pass).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const confirmButton = 'BTCONFIRMA'
        await page.click(`input[name=${confirmButton}]`).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const result = await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 3000 }).then(() => {
            return '';
        }).catch(async () => {
            const resultId = 'span_vSAIDA';
            const result = await page.waitForSelector(`#${resultId}`).then((res) => {
                return res?.evaluate(val => val.querySelector('text')?.textContent);
            }).catch(() => { });

            return result ?? 'Problema com a conexão';
        });

        if (result) return res.status(400).json({ response: result });

        await page.locator('.PopupHeaderButton').setTimeout(2000).click().catch(() => { });

        await page.goto(pageHistory, { waitUntil: 'networkidle2' });

        const historyCompleteRaw = await page.waitForSelector(`input[name=${globalContainerData()}]`, { hidden: true }).then((res) => {
            return res?.evaluate(val => val.value);
        }).catch(() => (''));

        const history = transformData(historyCompleteRaw ?? "", 'history');

        return res.status(200).json({ data: history });
    }

    static async getSchedule(req: Request, res: Response) {
        const { auth } = req.body;

        if (!auth) return res.status(400).json({ error: "Preencha todos os campos" });

        const credentials = decode(auth);

        const user = credentials.substring(0, credentials.lastIndexOf(' | ')).trim();
        const pass = credentials.substring(credentials.lastIndexOf('| ') + 1, credentials.length).trim();
        const credential = { user: user, pass: pass }

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(pageLogin, { waitUntil: 'networkidle2' }).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const nameInput = '#vSIS_USUARIOID';
        await page.type(nameInput, credential.user).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const passInput = '#vSIS_USUARIOSENHA'
        await page.type(passInput, credential.pass).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const confirmButton = 'BTCONFIRMA'
        await page.click(`input[name=${confirmButton}]`).catch(() => {
            res.status(400).json({ error: "Problema ao acessar o siga" });
        });

        const result = await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 3000 }).then(() => {
            return '';
        }).catch(async () => {
            const resultId = 'span_vSAIDA';
            const result = await page.waitForSelector(`#${resultId}`).then((res) => {
                return res?.evaluate(val => val.querySelector('text')?.textContent);
            }).catch(() => { });

            return result ?? 'Problema com a conexão';
        });

        //In case of some error occurred
        if (result) return res.status(400).json({ response: result });

        await page.locator('.PopupHeaderButton').setTimeout(2000).click().catch(() => { });

        await page.goto(pageSchedule, { waitUntil: 'networkidle2' });

        const scheduleHeaderRaw = await page.waitForSelector(`input[name=${globalContainerData()}]`, { hidden: true }).then((res) => {
            return res?.evaluate(val => val.value);
        }).catch(() => (''));

        const scheduleContentRaw = await page.waitForSelector(`input[name=${globalContainerData(2)}]`, { hidden: true }).then((res) => {
            return res?.evaluate(val => val.value);
        }).catch(() => (''));

        console.log(scheduleHeaderRaw);
        console.log(scheduleContentRaw);

        await browser.close();

        return res.status(200).json({ data: scheduleHeaderRaw });

    }
}