const express = require('express');
const {
  User, Attachment, Email,
} = require('../database');
const { responseConstruct } = require('../helpers/constructor');
const ejwt = require('../middlewares/extendedJWT');

const router = express.Router();
router.use(ejwt());

/**
 * get company email
 */
router.get(
  '/',
  async (req, res) => {
    const data = [];
    const dbQuery = {
      include: [Attachment],
      order: [['sent', 'DESC']],
    };

    if (req.auth.type !== 'superadmin') {
      const user = await User.findByPk(req.auth.userId);
      dbQuery.where = { companyId: user.companyId };
    }

    // get all email and attachments
    const emails = await Email.findAll(dbQuery);

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      const attachmentList = [];
      for (let x = 0; x < email.attachments.length; x++) {
        const attachment = email.attachments[x];

        attachmentList.push({
          id: attachment.id,
          name: attachment.name,
          length: attachment.length,
          url: `${req.hostname}/api/attachment/${attachment.series}`,
        });
      }

      data.push({
        id: email.id,
        from: email.from,
        to: email.to,
        subject: email.subject,
        date: email.sent,
        caller: email.caller,
        callee: email.callee,
        call_time: email.callTime,
        attachments: attachmentList,
      });
    }

    res.json(responseConstruct('success', data));
  },
);

module.exports = router;
