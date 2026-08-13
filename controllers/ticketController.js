const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const Booking = require("../models/Booking");

const generateTicketQR = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("event", "title eventDate startTime endTime location")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this ticket",
      });
    }

    if (
      booking.bookingStatus !== "confirmed" ||
      booking.paymentStatus !== "paid"
    ) {
      return res.status(400).json({
        success: false,
        message: "Ticket is available only after successful payment",
      });
    }

    const qrData = JSON.stringify({
      ticketCode: booking.ticketCode,
      bookingId: booking._id,
    });

    const qrCode = await QRCode.toDataURL(qrData);

    res.status(200).json({
      success: true,
      ticket: {
        ticketCode: booking.ticketCode,
        event: booking.event,
        user: booking.user,
        ticketType: booking.ticketType,
        quantity: booking.quantity,
        totalAmount: booking.totalAmount,
        qrCode,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const downloadTicket = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("event", "title eventDate startTime endTime location")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to download this ticket",
      });
    }

    if (
      booking.bookingStatus !== "confirmed" ||
      booking.paymentStatus !== "paid"
    ) {
      return res.status(400).json({
        success: false,
        message: "Ticket is available only after successful payment",
      });
    }

    const qrData = JSON.stringify({
      ticketCode: booking.ticketCode,
      bookingId: booking._id,
    });

    const qrBuffer = await QRCode.toBuffer(qrData);

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket-${booking.ticketCode}.pdf`
    );

    doc.pipe(res);

    doc
      .fontSize(24)
      .text("EVENT TICKET", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(18)
      .text(booking.event.title, {
        align: "center",
      });

    doc.moveDown(2);

    doc.fontSize(12);

    doc.text(`Ticket Code: ${booking.ticketCode}`);
    doc.moveDown();

    doc.text(`Name: ${booking.user.name}`);
    doc.text(`Email: ${booking.user.email}`);

    doc.moveDown();

    doc.text(`Ticket Type: ${booking.ticketType}`);
    doc.text(`Quantity: ${booking.quantity}`);
    doc.text(`Amount Paid: ₹${booking.totalAmount}`);

    doc.moveDown();

    doc.text(
      `Date: ${new Date(booking.event.eventDate).toLocaleDateString()}`
    );

    doc.text(`Start Time: ${booking.event.startTime}`);
    doc.text(`End Time: ${booking.event.endTime}`);
    doc.text(`Location: ${booking.event.location}`);

    doc.moveDown(2);

    doc.image(qrBuffer, {
      fit: [180, 180],
      align: "center",
    });

    doc.moveDown();

    doc
      .fontSize(10)
      .text("Please present this QR code at the event.", {
        align: "center",
      });

    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateTicketQR,
  downloadTicket,
};