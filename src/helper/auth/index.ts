export const decrypt = async (str: string): Promise<string> => {
    const key = Buffer.from(process.env.PRIVATE_KEY ?? '', "base64");

    if (!key) return '';

    const importedKey = await crypto.subtle.importKey("pkcs8", key, { name: 'RSA-OAEP', hash: { name: 'SHA-256' } }, false, ["decrypt"]);

    const textEncoded = Buffer.from(str, "base64");

    const text = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        importedKey,
        textEncoded).catch((e) => { console.log(e); throw 'Erro'; });

    const plainText = new TextDecoder().decode(text!);

    return plainText;
}
