import { Request, Response, NextFunction } from 'express'
import { decode } from '../helper/auth';
import puppeteer from 'puppeteer';
import { pageLogin } from '../constants';

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) return res.status(401).json({ error: 'Credenciais não informadas!' });

    const credential = decode(authorization);

    const user = credential.substring(0, credential.lastIndexOf(' | ')).trim();
    const pass = credential.substring(credential.lastIndexOf('| ') + 1, credential.length).trim();

    if (!user || !pass) return res.status(401).json({ error: 'Credenciais não informadas!' });


    try {
        const browser = await puppeteer.launch({ headless: "shell" });
        const page = await browser.newPage();

        await page.goto(pageLogin, { waitUntil: 'networkidle2' });

        const nameInput = '#vSIS_USUARIOID';
        await page.type(nameInput, user);

        const passInput = '#vSIS_USUARIOSENHA'
        await page.type(passInput, pass);

        const confirmButton = 'BTCONFIRMA'
        await page.click(`input[name=${confirmButton}]`);

        const result = await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 3000 }).then(() => {
            return '';
        }).catch(async () => {
            const resultId = 'span_vSAIDA';
            const result = await page.waitForSelector(`#${resultId}`).then((res) => {
                return res?.evaluate(val => val.querySelector('text')?.textContent);
            });

            return result ?? 'Problema com a conexão';
        });

        if (result) return res.status(400).json({ error: result });

        await page.locator('.PopupHeaderButton').setTimeout(1000).click().catch(() => { });

        req.headers.user = pass;
        req.headers.pass = user;

        res.locals.page = page;
        res.locals.browser = browser;
        next();
    } catch (err) {
        return res.status(400).json({ error: "Problema ao acessar o siga" });;
    } finally {
    }
}