import puppeteer, { Browser, Page } from "puppeteer-core";
import { transformData } from './helper/transformData';
import { globalContainerData, pageHistory, pageSchedule, pageLogin, pageGrades, globalAllInfo } from './constants';
import { ScheduleClassProps, ScheduleProps } from './interfaces/schedule';
import { StudentDataProps } from './interfaces/student';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { decode } from './helper/auth';
import chromium_min from '@sparticuz/chromium-min';
import Chromium = require("@sparticuz/chromium");

async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    const { authorization } = event.headers;
    const options = ['basic', 'grade', 'history', 'schedule'];
    const action = event.pathParameters?.action;

    if (!action || !options.includes(action)) return { statusCode: 400, body: JSON.stringify({ error: "Nenhuma função especificada" }) };

    if (!authorization) return {
        statusCode: 401,
        body: JSON.stringify({ error: "Credenciais não informadas!" })
    }

    const credential = decode(authorization);

    const user = credential.substring(0, credential.lastIndexOf(' | ')).trim();
    const pass = credential.substring(credential.lastIndexOf('| ') + 1, credential.length).trim();

    if (!user || !pass) return {
        statusCode: 401,
        body: JSON.stringify({ error: "Credenciais não informadas!" })
    }

    const browser_path = await Chromium.executablePath();

    if (!browser_path) throw "Não foi possível concluir a solicitação";

    console.log('Connected to browser...');

    const browser = await puppeteer.launch({
        args: chromium_min.args,
        defaultViewport: chromium_min.defaultViewport,
        executablePath: await chromium_min.executablePath(browser_path),
        headless: chromium_min.headless,
    })
        .then((res) => { console.log("Connected"); return res; })
        .catch(() => { });

    if (!browser) return { statusCode: 500, body: JSON.stringify({ error: "Problema ao acessar o siga" }) };

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

        if (result) return {
            statusCode: 400,
            body: JSON.stringify({ error: result })
        }

        await page.waitForSelector('.PopupHeaderButton', { timeout: 1000 }).then((res) => res?.click().catch(() => { })).catch(() => { });

        let response;

        switch (action) {
            case 'grade':
                response = await Data.getGrade(page);
                break;
            case 'history':
                response = await Data.getHistory(page);
                break;
            case 'schedule':
                response = await Data.getSchedule(page);
                break;
            case 'basic':
                response = await Data.getAll(page);
                break;
            default:
                response = JSON.stringify({ statusCode: 200, body: { data: 'No data' } })
                break;
        }

        return response;
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Problema ao acessar o siga", detail: JSON.stringify(err) })
        }
    } finally {
        await browser.close();
    }
}

class Data {
    static async getAll(page: Page) {
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

            return JSON.stringify(
                {
                    statusCode: 200,
                    body: {
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
                    }
                });

        } catch (error) {
            console.log(error);
            return JSON.stringify({ statusCode: 400, error: 'Não foi possível resgatar os dados' });
        }
    }

    static async getHistory(page: Page) {
        try {
            await page.goto(pageHistory, { waitUntil: 'networkidle2' });

            const dataRaw = await page.waitForSelector(`input[name=${globalAllInfo}]`, { hidden: true }).then((res) => {
                if (res) return res.evaluate(val => val.value);
                throw "Não foi possível resgatar os dados";
            });

            const data = dataRaw.substring(dataRaw.indexOf('[{"ACD_AlunoId'), dataRaw.lastIndexOf(']') + 1);

            const history = transformData(data ?? "", 'history');

            return JSON.stringify({ statusCode: 200, body: { data: history } });

        } catch (error) {
            return JSON.stringify({ statusCode: 400, error: 'Não foi possível resgatar os dados' });
        }
    }

    static async getSchedule(page: Page) {
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

            return JSON.stringify({ statusCode: 200, body: { data: scheduleHeader } });
        } catch (error) {
            return JSON.stringify({ statusCode: 400, error: 'Não foi possível resgatar os dados' });
        }
    }

    static async getGrade(page: Page) {
        try {
            await page.goto(pageGrades, { waitUntil: 'networkidle2' });

            const dataRaw = await page.waitForSelector(`input[name=${globalAllInfo}]`, { hidden: true }).then((res) => {
                if (res) return res.evaluate(val => val.value);
                throw "Não foi possível resgatar os dados";
            });

            const objectName = '"vACD_ALUNONOTASPARCIAISRESUMO_SDT":';
            const data = dataRaw.substring(dataRaw.indexOf(objectName) + objectName.length, dataRaw.lastIndexOf('}]') + 2);

            const grades = transformData(data, 'grades');

            return JSON.stringify({ statusCode: 200, body: { data: grades } });
        } catch (error) {
            return JSON.stringify({ statusCode: 400, error: 'Não foi possível resgatar os dados' });
        }
    }
}

module.exports.handler = handler;