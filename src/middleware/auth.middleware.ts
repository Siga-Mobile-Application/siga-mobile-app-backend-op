import { Request, Response, NextFunction } from 'express'
import { decode } from '../helper/auth';
import puppeteer from "puppeteer";
import { pageLogin } from '../constants';

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) return res.status(401).json({ error: 'Credenciais não informadas!' });

    const credential = decode(authorization);

    const user = credential.substring(0, credential.lastIndexOf(' | ')).trim();
    const pass = credential.substring(credential.lastIndexOf('| ') + 1, credential.length).trim();

    if (!user || !pass) return res.status(401).json({ error: 'Credenciais não informadas!' });

    const browser = await puppeteer.launch({ headless: true, args: [ '--ignore-certificate-errors' ] })
    .then((res) => { console.log("Connected to browser..."); return res; })
    .catch(() => { });

    if (!browser) return res.status(500).json({ error: "Problema ao acessar o siga" });

    try {
        console.log('New page...');

        const page = await browser.newPage().then((res) => { console.log("In new page"); return res; });

        console.log('Going to SIGA...');

        await page.goto(pageLogin, { waitUntil: 'load' }).then((res) => { console.log("Accessed SIGA"); return res; });

        const title_login = await page.title();

        if (title_login) console.log('Title: ' + title_login);

        console.log('Input user id...');
        const nameInput = '#vSIS_USUARIOID';
        await page!.type(nameInput, user).then((res) => { console.log("User id inputed"); return res; });

        console.log('Input user pass...');
        const passInput = '#vSIS_USUARIOSENHA'
        await page.type(passInput, pass).then((res) => { console.log("User pass inputed"); return res; });

        console.log('Click confirm button...');
        const confirmButton = 'BTCONFIRMA'
        await page.click(`input[name=${confirmButton}]`).then((res) => { console.log("Button clicked"); return res; });

        console.log('Going to home page...');

        const result = await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).then(() => {
            console.log("Home loaded...")
            return '';
        }).catch(async () => {
            const resultId = 'span_vSAIDA';
            const result = await page.waitForSelector(`#${resultId}`).then((res) => {
                return res?.evaluate(val => val.querySelector('text')?.textContent).catch(() => { });
            }).catch(() => { });

            return result ?? 'Problema com a conexão';
        });

        if (result) return res.status(400).json({ error: result });

        await page.waitForSelector('.PopupHeaderButton', { timeout: 1000 }).then((res) => res?.click().catch(() => { })).catch(() => { });

        res.locals.page = page;
        res.locals.browser = browser;

        next();
    } catch (err) {
        // await browser.close();
        return res.status(500).json({ error: "Problema ao acessar o siga", detail: JSON.stringify(err) });
    }
}