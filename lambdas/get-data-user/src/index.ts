import puppeteer, { Browser, Page } from "puppeteer-core";
import { transformData } from './helper/transformData';
import { globalContainerData, pageHistory, pageSchedule, pageLogin, pageGrades, globalAllInfo } from './constants';
import { ScheduleClassProps, ScheduleProps } from './interfaces/schedule';
import { StudentDataProps } from './interfaces/student';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { decode } from './helper/auth';
import Chromium from "@sparticuz/chromium";

async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    const { authorization } = event.headers;

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

    try {
        let message;

        const browser = await puppeteer.launch({
            args: Chromium.args,
            defaultViewport: Chromium.defaultViewport,
            executablePath: await Chromium.executablePath(),
            headless: Chromium.headless,
        })
            .catch((e) => {
                message = 'launch';
            });

        if (message) return { statusCode: 200, body: JSON.stringify({ message: message }) }

        const page = await browser!.newPage()
            .catch((e) => {
                message = 'page';
            });

        if (message) return { statusCode: 200, body: JSON.stringify({ message: message }) }

        await page!.goto(pageLogin, { waitUntil: 'networkidle2' })
            .catch((e) => {
                message = 'goto';
            });

        if (message) return { statusCode: 200, body: JSON.stringify({ message: message }) }

        const nameInput = '#vSIS_USUARIOID';
        await page!.type(nameInput, user);

        const passInput = '#vSIS_USUARIOSENHA'
        await page!.type(passInput, pass);

        const confirmButton = 'BTCONFIRMA'
        await page!.click(`input[name=${confirmButton}]`);

        const result = await page!.waitForNavigation({ waitUntil: 'networkidle0', timeout: 3000 }).then(() => {
            return '';
        }).catch(async () => {
            const resultId = 'span_vSAIDA';
            const result = await page!.waitForSelector(`#${resultId}`, { timeout: 3000 }).then((res) => {
                return res?.evaluate(val => val.querySelector('text')?.textContent);
            });

            return result ?? 'Problema com a conexão';
        });

        if (result) return {
            statusCode: 400,
            body: JSON.stringify({ error: result })
        }

        await page!.waitForSelector('.PopupHeaderButton', { timeout: 1000 }).then((res) => res?.click().catch());

        // req.headers.user = pass;
        // req.headers.pass = user;

        // res.locals.page = page;
        // res.locals.browser = browser;
        return {
            statusCode: 200,
            body: JSON.stringify({ error: "Acesso ao siga!" })
        }
    } catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Problema ao acessar o siga" })
        }
    }
}

// class Data {
//     static async getAll(user: string, pass: string, page: Page, browser: Browser) {
//         const dataRaw = await page.waitForSelector(`input[name=${globalAllInfo}]`, { hidden: true }).then((res) => {
//             return res?.evaluate(val => val.value);
//         }).catch(() => (''));

//         if (!dataRaw) return res.status(400).json({ error: 'Não foi possível resgatar os dados' });

//         try {
//             const student: StudentDataProps = JSON.parse(`${dataRaw.substring(0, dataRaw.indexOf(',"vEMAILWEBSAI"'))}}`);

//             const imageId = 'MPW0041FOTO'
//             const image = await page.waitForSelector(`div #${imageId}`).then((res) => {
//                 return res?.evaluate(val => val.querySelector('img')?.getAttribute('src'));
//             });

//             await browser.close();

//             return res.status(200).json({
//                 ra: student.MPW0041vACD_ALUNOCURSOREGISTROACADEMICOCURSO,
//                 nome: student.vPRO_PESSOALNOME.split('-')[0],
//                 email: student.MPW0041vINSTITUCIONALFATEC,
//                 situacao: student.vSITUACAO_MPAGE,
//                 periodo: student.vACD_PERIODODESCRICAO_MPAGE,
//                 curso: student.vACD_CURSONOME_MPAGE,
//                 unidade: student.vUNI_UNIDADENOME_MPAGE,
//                 semestre: student.MPW0041vACD_ALUNOCURSOCICLOATUAL,
//                 pp: student.MPW0041vACD_ALUNOCURSOINDICEPP,
//                 pr: student.MPW0041vACD_ALUNOCURSOINDICEPR,
//                 semestre_cursado: student.MPW0041vSEMESTRESCURSADOS,
//                 semestre_maximo: student.MPW0041vINTEGRALIZACAOMAX,
//                 semestre_restante: student.MPW0041vFALTA,
//                 picture: image ?? ""
//             });
//         } catch (error) {
//             console.log(error);
//             return res.status(400).json({ error: 'Não foi possível resgatar os dados' });
//         } finally {
//             browser.close();
//         }
//     }

//     static async getHistory(req: Request, res: Response) {
//         const { user, pass } = req.headers;
//         const page: Page = res.locals.page;
//         const browser: Browser = res.locals.browser;

//         try {
//             await page.goto(pageHistory, { waitUntil: 'networkidle2' });

//             const dataRaw = await page.waitForSelector(`input[name=${globalAllInfo}]`, { hidden: true }).then((res) => {
//                 return res?.evaluate(val => val.value);
//             }).catch(() => (''));

//             if (!dataRaw) return res.status(400).json({ error: 'Não foi possível resgatar os dados' });

//             const data = dataRaw.substring(dataRaw.indexOf('[{"ACD_AlunoId'), dataRaw.lastIndexOf(']') + 1);

//             const history = transformData(data ?? "", 'history');

//             return res.status(200).json({ data: history });

//         } catch (error) {
//             return res.status(400).json({ error: 'Não foi possível resgatar os dados' });
//         } finally {
//             browser.close();
//         }
//     }

//     static async getSchedule(req: Request, res: Response) {
//         const { user, pass } = req.headers;
//         const page: Page = res.locals.page;
//         const browser: Browser = res.locals.browser;

//         try {

//             await page.goto(pageSchedule, { waitUntil: 'networkidle2' });

//             const scheduleHeaderRaw = await page.waitForSelector(`input[name=${globalContainerData()}]`, { hidden: true }).then((res) => {
//                 return res?.evaluate(val => val.value);
//             }).catch(() => (''));

//             if (!scheduleHeaderRaw) return res.status(400).json({ error: 'Não foi possível resgatar os dados' });

//             const scheduleHeader: ScheduleProps[] = transformData(scheduleHeaderRaw, 'scheduleHeader');

//             for (let i = 2; i <= 7; i++) {
//                 const day = i == 2 ? "Segunda-Feira" : i == 3 ? "Terça-Feira" : i == 4 ? "Quarta-Feira" : i == 5 ? "Quinta-Feira" : i == 6 ? "Sexta-Feira" : "Sabado";

//                 const scheduleContentRaw = await page.waitForSelector(`input[name=${globalContainerData(i)}]`, { hidden: true }).then((res) => {
//                     return res?.evaluate(val => val.value);
//                 }).catch(() => (''));

//                 const scheduleContent: ScheduleClassProps[] = transformData(scheduleContentRaw ?? "", 'scheduleContent');

//                 scheduleContent.forEach(item => {
//                     scheduleHeader.forEach((header, index) => {
//                         if (header.sigla == item.sigla) {
//                             scheduleHeader[index].horario.push(item.horario);
//                             scheduleHeader[index].dia = day;
//                         }
//                     });
//                 });
//             }


//             return res.status(200).json({ data: scheduleHeader });
//         } catch (error) {
//             return res.status(400).json({ error: 'Não foi possível resgatar os dados' });
//         } finally {
//             browser.close();
//         }
//     }

//     static async getGrade(req: Request, res: Response) {
//         const { user, pass } = req.headers;
//         const page: Page = res.locals.page;
//         const browser: Browser = res.locals.browser;

//         try {
//             await page.goto(pageGrades, { waitUntil: 'networkidle2' });

//             const dataRaw = await page.waitForSelector(`input[name=${globalAllInfo}]`, { hidden: true }).then((res) => {
//                 return res?.evaluate(val => val.value);
//             }).catch(() => (''));

//             if (!dataRaw) return res.status(400).json({ error: 'Não foi possível resgatar os dados' });

//             const objectName = '"vACD_ALUNONOTASPARCIAISRESUMO_SDT":';
//             const data = dataRaw.substring(dataRaw.indexOf(objectName) + objectName.length, dataRaw.lastIndexOf('}]') + 2);

//             const grades = transformData(data, 'grades');

//             return res.status(200).json({ data: grades });
//         } catch (error) {
//             return res.status(400).json({ error: 'Não foi possível resgatar os dados' });
//         } finally {
//             browser.close();
//         }
//     }
// }


module.exports.handler = handler;