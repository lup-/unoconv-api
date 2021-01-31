const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');
const unoconv = require('unoconv2');
const childProcess = require('child_process');

const FILES_PATH = process.env.FILES_PATH || path.join(__dirname, '/files/');
const UNOCONV_BIN = process.env.UNOCONV_BIN || 'unoconv';
const SOFFICE_BIN = process.env.SOFFICE_BIN || 'soffice';

function sofficeConvert(file, outputFormat) {
    let stdout = [];
    let stderr = [];

    return new Promise((resolve, reject) => {
        let child = childProcess.spawn(SOFFICE_BIN, ['--convert-to', outputFormat, '--outdir', FILES_PATH, file]);
        child.stdout.on('data', data => stdout.push(data));
        child.stderr.on('data', data => stderr.push(data));

        child.on('exit', () => {
            if (stderr.length) {
                return reject(new Error(Buffer.concat(stderr).toString()));
            }
            resolve(Buffer.concat(stdout));
        });
    });
}


module.exports = {
    async listFormats(ctx) {
        ctx.body = await this.getUnoconvFormats();
    },
    async convertDoc(ctx) {
        let uploadedFile = ctx.file;
        let targetFormat = ctx.params.format || false;

        if (!targetFormat) {
            targetFormat = 'txt';
        }

        let srcFileName = uploadedFile.originalname;
        let dstFileName = srcFileName.replace(/\..*$/, '.'+targetFormat);
        let srcFilePath = path.join(FILES_PATH, srcFileName);
        let dstFilePath = path.join(FILES_PATH, dstFileName);
        fs.writeFileSync(srcFilePath, uploadedFile.buffer);

        try {
            await sofficeConvert(srcFilePath, targetFormat);
            let resultFileBuffer = fs.readFileSync(dstFilePath);
            let formatMeta = await this.getFormatMetadata(targetFormat);
            let mimeType = formatMeta.mime;

            ctx.attachment(dstFileName);
            ctx.type = mimeType;
            ctx.body = resultFileBuffer;
        }
        catch (e) {
            ctx.status = 500;
            ctx.body = {error: e.toString()};
        }

        await this.cleanupTmpFiles([srcFilePath, dstFilePath]);
    },
    async cleanupTmpFiles(files = []) {
        for (const file of files) {
            try {
                fs.unlinkSync(file);
            }
            catch (e) {}
        }
    },
    async getFormatMetadata(extension) {
        let formats = await this.getUnoconvFormats();
        return formats.find(item => item.extension.toLowerCase() === extension.toLowerCase()) || false;
    },
    getUnoconvFormats() {
        if (this.cachedFormats) {
            return this.cachedFormats;
        }

        return new Promise( (resolve, reject) => {
            unoconv.detectSupportedFormats({
                bin: UNOCONV_BIN,
            }, (err, detectedFormats) => {
                if (err) {
                    reject(err);
                    return;
                }

                let groups = Object.keys(detectedFormats);
                let targetFormats = [];
                for (const group of groups) {
                    targetFormats = targetFormats.concat( detectedFormats[group].map(format => {
                        format.group = group;
                        return format;
                    }) );
                }

                this.cachedFormats = targetFormats;
                resolve(targetFormats);
            });
        });
    },
    bufferToStream(buffer) {
        return Readable.from(buffer);
    },
}