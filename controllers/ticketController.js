const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const Booking = require("../models/Booking");

// const generateTicketQR = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id)
//       .populate("event", "title eventDate startTime endTime location")
//       .populate("user", "name email");

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     if (booking.user._id.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not allowed to access this ticket",
//       });
//     }

//     if (
//       booking.bookingStatus !== "confirmed" ||
//       booking.paymentStatus !== "paid"
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Ticket is available only after successful payment",
//       });
//     }

//     const qrData = JSON.stringify({
//       ticketCode: booking.ticketCode,
//       bookingId: booking._id,
//     });

//     const qrCode = await QRCode.toDataURL(qrData);

//     res.status(200).json({
//       success: true,
//       ticket: {
//         ticketCode: booking.ticketCode,
//         event: booking.event,
//         user: booking.user,
//         ticketType: booking.ticketType,
//         quantity: booking.quantity,
//         totalAmount: booking.totalAmount,
//         qrCode,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

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

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket-${booking.ticketCode}.pdf`,
    );

    doc.pipe(res);

    // -----------------------------
    // Helpers
    // -----------------------------

    const pageWidth = doc.page.width;

    const left = 55;
    const ticketWidth = pageWidth - 110;

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const formatTime = (time) => {
      if (!time) return "-";

      const [hours, minutes] = time.split(":");

      const date = new Date();
      date.setHours(Number(hours));
      date.setMinutes(Number(minutes));

      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const detail = (label, value, x, y, width = 140) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("#7C3AED")
        .text(label.toUpperCase(), x, y, {
          width,
          characterSpacing: 0.7,
        });

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#0F172A")
        .text(String(value || "-"), x, y + 16, {
          width,
        });
    };

    // -----------------------------
    // Page background
    // -----------------------------

    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#F8FAFC");

    // -----------------------------
    // Ticket container
    // -----------------------------

    const ticketTop = 65;

    doc
      .roundedRect(left, ticketTop, ticketWidth, 650, 18)
      .fillAndStroke("#FFFFFF", "#E2E8F0");

    // -----------------------------
    // Header
    // -----------------------------

    doc.roundedRect(left, ticketTop, ticketWidth, 190, 18).fill("#4C1D95");

    // Cover bottom rounded corners so header joins body cleanly
    doc.rect(left, ticketTop + 165, ticketWidth, 25).fill("#4C1D95");

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#FFFFFF")
      .text("EVENTORA", left + 30, ticketTop + 28);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#DDD6FE")
      .text("OFFICIAL EVENT TICKET", left + 30, ticketTop + 55, {
        characterSpacing: 1.2,
      });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#C4B5FD")
      .text("YOU'RE GOING TO", left + 30, ticketTop + 95, {
        characterSpacing: 1,
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(25)
      .fillColor("#FFFFFF")
      .text(booking.event.title, left + 30, ticketTop + 115, {
        width: ticketWidth - 60,
        height: 60,
        ellipsis: true,
      });

    // -----------------------------
    // Event details
    // -----------------------------

    const detailsY = ticketTop + 225;

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#7C3AED")
      .text("EVENT DETAILS", left + 30, detailsY, {
        characterSpacing: 1.2,
      });

    detail(
      "Date",
      formatDate(booking.event.eventDate),
      left + 30,
      detailsY + 32,
      130,
    );

    detail(
      "Time",
      `${formatTime(booking.event.startTime)} - ${formatTime(
        booking.event.endTime,
      )}`,
      left + 180,
      detailsY + 32,
      150,
    );

    detail("Location", booking.event.location, left + 350, detailsY + 32, 130);

    // -----------------------------
    // Dashed divider
    // -----------------------------

    const dividerY = detailsY + 95;

    doc
      .moveTo(left + 30, dividerY)
      .lineTo(left + ticketWidth - 30, dividerY)
      .dash(5, { space: 5 })
      .strokeColor("#CBD5E1")
      .stroke();

    doc.undash();

    // -----------------------------
    // Attendee
    // -----------------------------

    const attendeeY = dividerY + 30;

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#7C3AED")
      .text("ATTENDEE", left + 30, attendeeY, {
        characterSpacing: 1.2,
      });

    detail("Name", booking.user.name, left + 30, attendeeY + 30, 210);

    detail("Email", booking.user.email, left + 270, attendeeY + 30, 220);

    // -----------------------------
    // Admission
    // -----------------------------

    const admissionY = attendeeY + 100;

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#7C3AED")
      .text("ADMISSION", left + 30, admissionY, {
        characterSpacing: 1.2,
      });

    detail("Ticket Type", booking.ticketType, left + 30, admissionY + 30, 130);

    detail("Quantity", booking.quantity, left + 180, admissionY + 30, 100);

    /*
     * Use Rs. instead of the rupee symbol because PDFKit's
     * built-in Helvetica font may not render ₹ correctly.
     */
    detail(
      "Amount Paid",
      `Rs. ${booking.totalAmount}`,
      left + 310,
      admissionY + 30,
      150,
    );

    // -----------------------------
    // Ticket code
    // -----------------------------

    const codeY = admissionY + 105;

    doc.roundedRect(left + 30, codeY, ticketWidth - 60, 95, 12).fill("#F5F3FF");

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#7C3AED")
      .text("TICKET CODE", left + 30, codeY + 20, {
        width: ticketWidth - 60,
        align: "center",
        characterSpacing: 1.5,
      });

    doc
      .font("Courier-Bold")
      .fontSize(19)
      .fillColor("#0F172A")
      .text(booking.ticketCode, left + 30, codeY + 42, {
        width: ticketWidth - 60,
        align: "center",
      });

    // -----------------------------
    // Status
    // -----------------------------

    const statusY = codeY + 120;

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#15803D")
      .text("BOOKING CONFIRMED", left + 30, statusY);

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#15803D")
      .text("PAYMENT PAID", left + 190, statusY);

    // -----------------------------
    // Footer
    // -----------------------------

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#64748B")
      .text(
        "Please keep this ticket available for verification at the event.",
        left + 30,
        statusY + 35,
        {
          width: ticketWidth - 60,
          align: "center",
        },
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#94A3B8")
      .text("EVENTORA • EVENT MANAGEMENT SYSTEM", left + 30, statusY + 58, {
        width: ticketWidth - 60,
        align: "center",
        characterSpacing: 0.7,
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
  // generateTicketQR,
  downloadTicket,
};
