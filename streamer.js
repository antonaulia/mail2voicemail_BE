/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
require('dotenv').config();

const { SMTPServer } = require('smtp-server');
const { MailParser } = require('mailparser');
const fs = require('fs');
const { getAudioDurationInSeconds } = require('get-audio-duration');
const {
  sequelize, Company, Email, Attachment, User,
} = require('./database');

const parser = new MailParser();

// Connect to database
(async () => {
  await sequelize.authenticate();
})();

// store all email data based on database column
let emailFrom;
let emailTo;
let emailSend;
let emailSubject;
let companyId;
let callTime;
let caller;
let callee;
const attachments = [];
let bodyParsed = false;

const server = new SMTPServer({
  secure: false,
  logger: true,
  disabledCommands: ['AUTH'],
  onConnect(session, callback) {
    console.log('connecting');
    return callback(); // Accept the connection
  },
  onRcptTo(address, session, callback) {
    /**
     * Here we need to check if recipient email address is exists in database
     * if email address is exists, email will be processed. unless email should
     * be rejected.
     */

    User.count({ where: { email: address.address } })
      .then((count) => {
        if (count < 1) { // if count is less than 1 means email recipient is not exists
          return callback(new Error('Unknown recipient address'));
        }
      });

    return callback(); // Accept the address
  },
  onData(stream, session, callback) {
    /**
     * Here all email data will be processed. all attachment will be saved in public
     * directory.
     */

    parser.on('headers', (headers) => {
      emailFrom = headers.has('from') ? headers.get('from').text : null;
      emailTo = headers.has('to') ? headers.get('to').text : null;
      emailSend = headers.has('date') ? headers.get('date').text : null;
      emailSubject = headers.has('subject') ? headers.get('subject') : null;
    });

    parser.on('data', (data) => {
      // prepare directory to store attachment
      if (data.type === 'attachment') {
        User.findOne({
          where: { email: emailTo },
          include: [Company],
        }).then((user) => {
          companyId = user.company.id;
          const basePath = user.company.basePath;
          const realPath = `${__dirname}/public/attachment/${basePath}/${user.email}`;

          // check if directory exists
          if (!fs.existsSync(realPath)) {
            fs.mkdirSync(realPath, { recursive: true });
          }

          // parse attachment
          console.log(`writing ${data.filename}`);
          // create write stream
          const filePath = `${realPath}/${data.filename}`;
          const writeStream = fs.createWriteStream(filePath);

          data.content.pipe(writeStream);
          data.content.on('end', () => {
            data.release();

            // count audio length in second
            getAudioDurationInSeconds(filePath).then((duration) => {
              attachments.push({
                name: data.filename,
                path: filePath,
                length: (duration).toFixed(),
              });
            });
          });
        });
      };

        // parse body
      if (data.type === 'text') {
        const body = data.text;
        // regexp pattern
        const datePattern = /Date (.+)$/mi;
        const timePattern = /Time (.+)$/mi;
        const callerPattern = /Caller \[(.+)\]$/mi;
        const calleePattern = /Callee \[(.+)\]$/mi;

        callTime = `${body.match(datePattern)[1]} ${body.match(timePattern)[1]}`;
        caller = body.match(callerPattern)[1];
        callee = body.match(calleePattern)[1];
        bodyParsed = true;
      }
    });

    parser.on('end', () => {
      console.log('Closing.');
    });

    stream.pipe(parser); // Parse mail
    stream.on('end', callback);
  },
  onClose(session) {
    console.log('save email info');
    // save email to database
    Email.create({
      from: emailFrom,
      to: emailTo,
      sent: emailSend,
      subject: emailSubject,
      companyId: companyId,
      caller,
      callee,
      callTime: new Date(callTime),
    }).then((email) => {
      // check if email failed to save
      if (!email) {
        return callback(new Error('Failed to save email'));
      }

      for (let i = 0; i < attachments.length; i++) {
        const data = attachments[i];
        data.emailId = email.id;
      }

      // Save attachments
      Attachment.bulkCreate(attachments)
        .then((savedAttachments) => { console.log(`${savedAttachments.length} attachments saved`); });
    });

    console.log('closing connection');
  },
});

server.on('error', (err) => {
  console.log('error %s', err.message);
});

const port = process.env.SMTPPORT;
const host = process.env.HOST;

server.listen(port, host);
