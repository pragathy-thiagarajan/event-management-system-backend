const SupportInquiry = require(
  "../models/SupportInquiry"
);

// User creates inquiry
const createInquiry = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Subject and message are required",
      });
    }

    const inquiry =
      await SupportInquiry.create({
        user: req.user._id,
        subject,
        message,
      });

    return res.status(201).json({
      success: true,
      message:
        "Support inquiry submitted successfully",
      inquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// User sees own inquiries
const getMyInquiries = async (req, res) => {
  try {
    const inquiries =
      await SupportInquiry.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin sees all inquiries
const getAllInquiries = async (req, res) => {
  try {
    const inquiries =
      await SupportInquiry.find()
        .populate("user", "name email")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin responds / changes status
const updateInquiry = async (req, res) => {
  try {
    const {
      status,
      adminResponse,
    } = req.body;

    const inquiry =
      await SupportInquiry.findById(
        req.params.id
      );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message:
          "Support inquiry not found",
      });
    }

    if (
      status &&
      ![
        "open",
        "in-progress",
        "resolved",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    if (status) {
      inquiry.status = status;
    }

    if (adminResponse !== undefined) {
      inquiry.adminResponse =
        adminResponse;
    }

    await inquiry.save();

    return res.status(200).json({
      success: true,
      message:
        "Support inquiry updated successfully",
      inquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createInquiry,
  getMyInquiries,
  getAllInquiries,
  updateInquiry,
};