export const decode = (str: string):string => Buffer.from(str, 'base64').toString();
export const encode = (str: string):string => Buffer.from(str, 'utf-8').toString('base64');