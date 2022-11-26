const p = require('path');
const fs = require('fs');
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const Loader = require('./loader');

yargs(hideBin(process.argv))
    .command('upload', 'Uploading files from a given path', (yargs) => yargs, executor)
    .option('endpoint', {
        alias: 'e',
        type: 'string',
        description: 'Endpoint including port'
    })
    .option('access_key_id', {
        alias: 'a',
        type: 'string',
        description: 'Access key id'
    })
    .option('secret_access_key', {
        alias: 's',
        type: 'string',
        description: 'Secret access key'
    })
    .option('path', {
        alias: 'p',
        type: 'string',
        description: 'File or folder path'
    })
    .option('bucket', {
        alias: 'b',
        type: 'string',
        description: 'Destination bucket'
    })
    .option('force_path_style', {
        type: 'bool',
        description: 'Force bucket path style access',
        default: true,
    })
    .option('random_names', {
        alias: 'r',
        type: 'bool',
        description: 'Randomize filenames with uuidv4',
        default: true,
    })
    .demandOption(['endpoint', 'access_key_id', 'secret_access_key', 'path'], 'Please provide all required arguments')
    .parse();

async function executor(argv) {
    const loader = new Loader();

    let paths;
    if (fs.statSync(argv.path).isDirectory()) {
        paths = fs.readdirSync(argv.path);
        paths = paths.map((path) => p.join(argv.path, path));
        paths = paths.filter((path) => fs.statSync(path).isFile());
    } else {
        paths = [p.join(argv.path)];
    }

    const endpoint = new AWS.Endpoint(argv.endpoint);
    const s3 = new AWS.S3({
        endpoint: endpoint,
        accessKeyId: argv.access_key_id,
        secretAccessKey: argv.secret_access_key,
        s3ForcePathStyle: argv.force_path_style,
    });

    for (const path of paths) {
        loader.start('Uploading');

        const blob = fs.readFileSync(path);
        const fileName = p.parse(path).base;
        const uploadedFile = await s3.upload({
            Bucket: argv.bucket,
            Key: argv.random_names ? `${uuidv4()}_${fileName}` : fileName,
            Body: blob,
        }).promise();

        loader.stop();
        console.log('\x1b[36m', `Uploaded ${fileName}`, '\x1b[0m\x1b[34m', uploadedFile.Location, '\x1b[0m');
    }
}