import { Request, Response } from 'express'
import puppeteer from "puppeteer";
import bcrypt from 'bcrypt'

export default class Data {
    static async get(req: Request, res: Response) {
        const {user, pass} = req.body;

        if(!user || !pass) return res.status(400).json({error: "Preencha todos os campos"});

        const url = 'https://siga.cps.sp.gov.br/aluno/login.aspx?'

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(url, {waitUntil: 'networkidle2'});

        const credential = {user: user, pass: pass}
        //user: bcrypt.hashSync(user, 10), pass: bcrypt.hashSync(pass, 10)

        const nameInput = '#vSIS_USUARIOID';
        await page.type(nameInput, credential.user);

        const passInput = '#vSIS_USUARIOSENHA'
        await page.type(passInput, credential.pass);

        const confirmButton = 'BTCONFIRMA'
        await page.click(`input[name=${confirmButton}]`);

        await page.waitForNavigation({waitUntil: 'networkidle0'});        

        await page.locator('.PopupHeaderButton').click();

        const nameId = 'span_MPW0041vPRO_PESSOALNOME'
        const name = await page.waitForSelector(`div #${nameId}`).then((res) => {
            return res?.evaluate(val => val.textContent)
        });
        
        const emailId = 'span_MPW0041vINSTITUCIONALFATEC'
        const email = await page.waitForSelector(`div #${emailId}`).then((res) => {
            return res?.evaluate(val => val.textContent)
        });

        const imageId = 'MPW0041FOTO'
        const image = await page.waitForSelector(`div #${imageId}`).then((res) => {
            return res?.evaluate(val => val.querySelector('img')?.getAttribute('src'));
        });

        await browser.close();

        return res.status(200).json({name: name, email: email, picture: image});
    }
}