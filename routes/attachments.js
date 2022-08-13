const express = require('express');
const { Op } = require('sequelize');
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
  '/:serial',
  async (req, res) => {
    const dbQuery = {
      where: { [Op.and]: [{ series: req.params.serial }] },
      include: [{
        model: Email,
        required: true,
      }],
    };

    if (req.auth.type !== 'superadmin') {
      const user = await User.findByPk(req.auth.userId);
      dbQuery.where[Op.and].push({ '$email.companyId$': user.companyId });
    }

    // get all email and attachments
    const attachment = await Attachment.findOne(dbQuery);

    if (!attachment) {
      return res.status(404).json(responseConstruct('Attachment not found'));
    }

    res
      .status(200)
      .set({ 'Content-Type': 'application/octet-stream' })
      .sendFile(attachment.path);
  },
);

module.exports = router;
